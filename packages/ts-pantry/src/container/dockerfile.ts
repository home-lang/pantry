import type { DockerInstruction, DockerStage, ParsedDockerfile } from './types'

/** Instruction keywords recognised by the parser. */
const KNOWN_INSTRUCTIONS = new Set([
  'FROM',
  'RUN',
  'CMD',
  'LABEL',
  'MAINTAINER',
  'EXPOSE',
  'ENV',
  'ADD',
  'COPY',
  'ENTRYPOINT',
  'VOLUME',
  'USER',
  'WORKDIR',
  'ARG',
  'ONBUILD',
  'STOPSIGNAL',
  'HEALTHCHECK',
  'SHELL',
])

/**
 * Extract leading parser directives (e.g. `# syntax=docker/dockerfile:1`,
 * `# escape=\``). Directives must appear before any builder instruction or
 * non-directive comment, per the Dockerfile spec.
 */
function parseDirectives(lines: string[]): { directives: Record<string, string>, bodyStart: number } {
  const directives: Record<string, string> = {}
  let i = 0
  for (; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed === '')
      continue
    const m = /^#\s*([a-z][a-z0-9_-]*)\s*=\s*(.+?)\s*$/i.exec(trimmed)
    if (!m)
      break
    directives[m[1].toLowerCase()] = m[2]
  }
  return { directives, bodyStart: 0 }
}

/**
 * Join physical lines into logical lines, honoring the escape character for
 * line continuations and dropping comments. Returns logical lines paired with
 * the 1-based source line where each begins.
 */
function joinContinuations(raw: string, escapeChar: string): Array<{ text: string, line: number }> {
  const physical = raw.split('\n')
  const out: Array<{ text: string, line: number }> = []
  let buffer = ''
  let startLine = 0
  const contRe = new RegExp(`${escapeChar === '\\' ? '\\\\' : '`'}\\s*$`)

  for (let i = 0; i < physical.length; i++) {
    let line = physical[i].replace(/\r$/, '')
    const isContinuing = buffer !== ''

    // Comment lines are skipped entirely — but only when not in the middle of
    // a continuation (a `#` mid-continuation is part of the argument).
    if (!isContinuing && line.trim().startsWith('#'))
      continue

    if (!isContinuing)
      startLine = i + 1

    if (contRe.test(line)) {
      // Strip the trailing escape char and join directly — a `\<newline>`
      // continuation is removed (the next line's leading whitespace is kept),
      // matching Docker's behavior of feeding one logical line to the shell.
      line = line.replace(contRe, '')
      buffer += line
      continue
    }

    buffer += line
    if (buffer.trim() !== '')
      out.push({ text: buffer, line: startLine })
    buffer = ''
  }
  if (buffer.trim() !== '')
    out.push({ text: buffer, line: startLine })

  return out
}

/** Pull leading `--flag=value` options off an argument string. */
function extractFlags(args: string): { flags: Record<string, string>, rest: string } {
  const flags: Record<string, string> = {}
  let rest = args.trimStart()
  const flagRe = /^--([a-z][a-z0-9-]*)=("[^"]*"|'[^']*'|\S+)\s*/i
  let m: RegExpExecArray | null = flagRe.exec(rest)
  while (m) {
    let value = m[2]
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\'')))
      value = value.slice(1, -1)
    flags[m[1]] = value
    rest = rest.slice(m[0].length)
    m = flagRe.exec(rest)
  }
  return { flags, rest: rest.trim() }
}

/**
 * Parse a Dockerfile into directives, global ARGs, and ordered build stages.
 */
export function parseDockerfile(content: string): ParsedDockerfile {
  const lines = content.split('\n')
  const { directives } = parseDirectives(lines)
  const escapeChar = directives.escape === '`' ? '`' : '\\'

  const logical = joinContinuations(content, escapeChar)

  const instructions: DockerInstruction[] = []
  const globalArgs: DockerInstruction[] = []
  const stages: DockerStage[] = []
  let current: DockerStage | undefined

  for (const { text, line } of logical) {
    const trimmed = text.trim()
    if (trimmed === '')
      continue

    const sp = trimmed.search(/\s/)
    const keyword = (sp === -1 ? trimmed : trimmed.slice(0, sp)).toUpperCase()
    const remainder = sp === -1 ? '' : trimmed.slice(sp + 1).trim()

    if (!KNOWN_INSTRUCTIONS.has(keyword)) {
      // Unknown keyword — surface it so callers can warn, but don't crash.
      const inst: DockerInstruction = { instruction: keyword, args: remainder, flags: {}, line }
      instructions.push(inst)
      if (current)
        current.instructions.push(inst)
      continue
    }

    const { flags, rest } = extractFlags(remainder)
    const inst: DockerInstruction = { instruction: keyword, args: rest, flags, line }
    instructions.push(inst)

    if (keyword === 'FROM') {
      const stage = parseFromInstruction(rest, flags, stages.length)
      stages.push(stage)
      current = stage
      continue
    }

    if (!current) {
      // Pre-FROM territory: only ARG (and directives) are legal here.
      if (keyword === 'ARG')
        globalArgs.push(inst)
      continue
    }

    current.instructions.push(inst)
  }

  return { directives, globalArgs, stages, instructions }
}

/** Parse the `FROM` argument into a stage (handles `AS name`). */
function parseFromInstruction(args: string, flags: Record<string, string>, index: number): DockerStage {
  const parts = args.split(/\s+/)
  const baseImage = parts[0] ?? 'scratch'
  let name: string | undefined
  const asIdx = parts.findIndex(p => p.toUpperCase() === 'AS')
  if (asIdx !== -1 && parts[asIdx + 1])
    name = parts[asIdx + 1]

  return {
    name,
    baseImage,
    platform: flags.platform,
    index,
    instructions: [],
  }
}

/**
 * Parse a CMD/ENTRYPOINT/RUN/SHELL/VOLUME argument that may be in JSON-array
 * ("exec") form `["a","b"]` or shell form `a b`. Returns the exec array, or
 * undefined when the value is shell form (caller decides how to wrap it).
 */
export function parseExecForm(args: string): string[] | undefined {
  const trimmed = args.trim()
  if (!trimmed.startsWith('['))
    return undefined
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed) && parsed.every(x => typeof x === 'string'))
      return parsed
  }
  catch {
    // Not valid JSON — treat as shell form.
  }
  return undefined
}

/**
 * Resolve a multi-stage build down to the stages required to produce `target`
 * (or the final stage). Returns the stages in build order. Currently linear:
 * every preceding stage is kept (COPY --from references are resolved by the
 * builder), which is correct though not maximally pruned.
 */
export function resolveBuildStages(parsed: ParsedDockerfile, target?: string): DockerStage[] {
  if (!target)
    return parsed.stages
  const targetIdx = parsed.stages.findIndex(s => s.name === target)
  if (targetIdx === -1)
    throw new Error(`Build target stage "${target}" not found`)
  return parsed.stages.slice(0, targetIdx + 1)
}
