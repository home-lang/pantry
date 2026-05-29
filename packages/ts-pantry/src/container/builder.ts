import type { DockerInstruction, DockerStage } from './types'
import type { BuildOptions, BuildResult, OciImageConfig } from './types'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { collectBuildContext } from './context'
import { parseDockerfile, parseExecForm, resolveBuildStages } from './dockerfile'
import { loadFreezer } from './freezerignore'
import {
  buildLayerFromRootfs,
  buildManifest,
  platformFields,
  serializeConfig,
  writeDockerArchive,
  writeOciLayout,
} from './oci'
import { extractLayer, pullImage } from './registry'

interface BuildState {
  env: Map<string, string>
  args: Map<string, string>
  workdir: string
  user?: string
  labels: Map<string, string>
  exposed: Set<string>
  volumes: Set<string>
  entrypoint?: string[]
  cmd?: string[]
  stopSignal?: string
  shell: string[]
}

function emptyState(): BuildState {
  return {
    env: new Map(),
    args: new Map(),
    workdir: '/',
    labels: new Map(),
    exposed: new Set(),
    volumes: new Set(),
    shell: ['/bin/sh', '-c'],
  }
}

/** Expand `${VAR}` and `$VAR` using build args + env (args take precedence). */
function expand(input: string, state: BuildState): string {
  const lookup = (name: string): string => state.args.get(name) ?? state.env.get(name) ?? ''
  return input
    .replace(/\$\{([A-Z0-9_]+)\}/gi, (_, n) => lookup(n))
    .replace(/\$([A-Z0-9_]+)/gi, (_, n) => lookup(n))
}

/** Split an `ENV`/`LABEL` argument into key/value pairs (both syntaxes). */
function parseKeyValues(args: string): Array<[string, string]> {
  const out: Array<[string, string]> = []
  // `K=V K2=V2` form (supports quotes); fallback to `K V…` form.
  if (/^\s*[A-Z0-9_]+=/i.test(args)) {
    const re = /([A-Z0-9_]+)=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\S+)/gi
    let m: RegExpExecArray | null = re.exec(args)
    while (m) {
      let v = m[2]
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\'')))
        v = v.slice(1, -1)
      out.push([m[1], v])
      m = re.exec(args)
    }
  }
  else {
    const sp = args.search(/\s/)
    if (sp !== -1)
      out.push([args.slice(0, sp), args.slice(sp + 1).trim()])
  }
  return out
}

/** Resolve a path against the current WORKDIR. */
function resolveInRootfs(rootfs: string, workdir: string, target: string): string {
  const abs = target.startsWith('/') ? target : path.posix.join(workdir, target)
  return path.join(rootfs, abs)
}

/** Decide the effective RUN execution mode. */
function effectiveRunMode(requested: BuildOptions['runMode']): 'chroot' | 'host' | 'skip' {
  if (requested && requested !== 'auto')
    return requested
  const isLinux = process.platform === 'linux'
  const isRoot = typeof process.getuid === 'function' && process.getuid() === 0
  return isLinux && isRoot ? 'chroot' : 'host'
}

function copyEntry(src: string, dest: string): void {
  const stat = fs.lstatSync(src)
  if (stat.isSymbolicLink()) {
    const link = fs.readlinkSync(src)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.rmSync(dest, { force: true })
    fs.symlinkSync(link, dest)
  }
  else if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    fs.cpSync(src, dest, { recursive: true })
  }
  else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

/**
 * Build an OCI image from a Dockerfile. Produces a docker-archive tarball and
 * an OCI layout directory under `outputDir`. The final image is flattened to a
 * single layer (base rootfs + build changes), which keeps the builder
 * registry-agnostic and the output trivially `docker load`-able.
 */
export async function buildImage(options: BuildOptions): Promise<BuildResult> {
  const context = path.resolve(options.context)
  const dockerfilePath = options.dockerfile
    ? path.resolve(options.dockerfile)
    : path.join(context, 'Dockerfile')
  if (!fs.existsSync(dockerfilePath))
    throw new Error(`Dockerfile not found: ${dockerfilePath}`)

  const parsed = parseDockerfile(fs.readFileSync(dockerfilePath, 'utf8'))
  const stages = resolveBuildStages(parsed, options.target)
  if (stages.length === 0)
    throw new Error('Dockerfile has no FROM instruction')

  const quiet = options.quiet ?? false
  const log = (msg: string): void => { if (!quiet) console.error(msg) }
  const runMode = effectiveRunMode(options.runMode)
  const { os: imgOs, architecture } = platformFields(options.platform)

  const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-build-'))
  const blobDir = path.join(workRoot, 'blobs')
  fs.mkdirSync(blobDir, { recursive: true })

  // Per-stage rootfs dirs so `COPY --from` can reference earlier stages.
  const stageRootfs = new Map<string, string>()
  const matcher = loadFreezer(context)
  const contextEntries = collectBuildContext(context, matcher)

  let finalState = emptyState()
  let finalRootfs = ''

  // Seed global ARGs.
  const globalArgs = new Map<string, string>()
  for (const a of parsed.globalArgs) {
    const [k, v] = parseKeyValues(a.args)[0] ?? []
    if (k)
      globalArgs.set(k, options.buildArgs?.[k] ?? v ?? '')
  }

  for (const stage of stages) {
    const state = emptyState()
    for (const [k, v] of globalArgs)
      state.args.set(k, v)

    const rootfs = path.join(workRoot, `stage-${stage.index}`)
    fs.mkdirSync(rootfs, { recursive: true })

    const baseRef = expand(stage.baseImage, state)
    log(`[stage ${stage.index}${stage.name ? ` ${stage.name}` : ''}] FROM ${baseRef}`)

    if (baseRef === 'scratch') {
      // Empty rootfs, default config.
    }
    else if (stageRootfs.has(baseRef)) {
      fs.cpSync(stageRootfs.get(baseRef)!, rootfs, { recursive: true })
    }
    else {
      const pulled = await pullImage(baseRef, blobDir, { platform: options.platform, quiet })
      for (const layer of pulled.layers)
        extractLayer(layer.path, rootfs)
      // Inherit base image config defaults.
      const bc = pulled.config.config || {}
      for (const e of bc.Env || []) {
        const eq = e.indexOf('=')
        if (eq !== -1)
          state.env.set(e.slice(0, eq), e.slice(eq + 1))
      }
      if (bc.WorkingDir)
        state.workdir = bc.WorkingDir
      if (bc.Entrypoint)
        state.entrypoint = bc.Entrypoint
      if (bc.Cmd)
        state.cmd = bc.Cmd
      if (bc.User)
        state.user = bc.User
      log(`  pulled base from ${pulled.source}`)
    }

    for (const inst of stage.instructions)
      applyInstruction(inst, state, rootfs, { context, contextEntries, stageRootfs, runMode, matcher, log })

    if (stage.name)
      stageRootfs.set(stage.name, rootfs)
    finalState = state
    finalRootfs = rootfs
  }

  // Flatten the final rootfs into a single layer.
  log('packaging image layer...')
  const layer = buildLayerFromRootfs(finalRootfs, blobDir)

  const created = new Date().toISOString()
  const config: OciImageConfig = {
    architecture,
    os: imgOs,
    created,
    config: {
      User: finalState.user,
      ExposedPorts: finalState.exposed.size
        ? Object.fromEntries([...finalState.exposed].map(p => [p, {}]))
        : undefined,
      Env: [...finalState.env].map(([k, v]) => `${k}=${v}`),
      Entrypoint: finalState.entrypoint,
      Cmd: finalState.cmd,
      Volumes: finalState.volumes.size
        ? Object.fromEntries([...finalState.volumes].map(v => [v, {}]))
        : undefined,
      WorkingDir: finalState.workdir !== '/' ? finalState.workdir : undefined,
      Labels: finalState.labels.size ? Object.fromEntries(finalState.labels) : undefined,
      StopSignal: finalState.stopSignal,
    },
    rootfs: { type: 'layers', diff_ids: [layer.diffId] },
    history: [{ created, created_by: 'pantry build', comment: 'flattened image' }],
  }

  const { bytes: configBytes, digest: configDigest } = serializeConfig(config)
  const { bytes: manifestBytes, digest: manifestDigest, manifest } = buildManifest(configDigest, configBytes.length, [layer])

  const tags = options.tags ?? []
  const outputDir = options.outputDir ? path.resolve(options.outputDir) : path.join(context, '.pantry', 'images')
  fs.mkdirSync(outputDir, { recursive: true })

  const ociLayoutPath = path.join(outputDir, 'oci-layout')
  fs.mkdirSync(ociLayoutPath, { recursive: true })
  writeOciLayout(ociLayoutPath, manifestBytes, manifestDigest, configBytes, configDigest, [layer], tags)

  const archiveName = `${(tags[0] || 'image').replace(/[/:]/g, '_')}.tar`
  const archivePath = path.join(outputDir, archiveName)
  writeDockerArchive(archivePath, configBytes, configDigest, [layer], tags)

  log(`built ${manifestDigest}`)

  // Best-effort cleanup of the staging rootfs (keep outputs).
  try { fs.rmSync(workRoot, { recursive: true, force: true }) }
  catch { /* ignore */ }

  return {
    imageId: manifestDigest,
    tags,
    archivePath,
    ociLayoutPath,
    config,
    layers: [layer],
    configBytes,
    configDigest,
    manifestBytes,
    manifestMediaType: manifest.mediaType,
  }
}

interface ApplyCtx {
  context: string
  contextEntries: ReturnType<typeof collectBuildContext>
  stageRootfs: Map<string, string>
  runMode: 'chroot' | 'host' | 'skip'
  matcher: ReturnType<typeof loadFreezer>
  log: (m: string) => void
}

function applyInstruction(inst: DockerInstruction, state: BuildState, rootfs: string, ctx: ApplyCtx): void {
  const argsExpanded = expand(inst.args, state)
  switch (inst.instruction) {
    case 'ENV': {
      for (const [k, v] of parseKeyValues(inst.args))
        state.env.set(k, expand(v, state))
      break
    }
    case 'ARG': {
      const [k, v] = parseKeyValues(inst.args)[0] ?? []
      if (k && !state.args.has(k))
        state.args.set(k, v ? expand(v, state) : '')
      break
    }
    case 'LABEL': {
      for (const [k, v] of parseKeyValues(inst.args))
        state.labels.set(k, expand(v, state))
      break
    }
    case 'WORKDIR': {
      const wd = argsExpanded.startsWith('/') ? argsExpanded : path.posix.join(state.workdir, argsExpanded)
      state.workdir = wd
      fs.mkdirSync(path.join(rootfs, wd), { recursive: true })
      break
    }
    case 'USER': {
      state.user = argsExpanded.trim()
      break
    }
    case 'EXPOSE': {
      for (const p of argsExpanded.split(/\s+/).filter(Boolean))
        state.exposed.add(p.includes('/') ? p : `${p}/tcp`)
      break
    }
    case 'VOLUME': {
      const arr = parseExecForm(inst.args)
      const vols = arr ?? argsExpanded.split(/\s+/).filter(Boolean)
      for (const v of vols)
        state.volumes.add(v)
      break
    }
    case 'STOPSIGNAL': {
      state.stopSignal = argsExpanded.trim()
      break
    }
    case 'SHELL': {
      const arr = parseExecForm(inst.args)
      if (arr)
        state.shell = arr
      break
    }
    case 'ENTRYPOINT': {
      const arr = parseExecForm(inst.args)
      state.entrypoint = arr ?? [...state.shell, argsExpanded]
      break
    }
    case 'CMD': {
      const arr = parseExecForm(inst.args)
      state.cmd = arr ?? [...state.shell, argsExpanded]
      break
    }
    case 'COPY':
    case 'ADD': {
      applyCopy(inst, state, rootfs, ctx)
      break
    }
    case 'RUN': {
      applyRun(inst, state, rootfs, ctx)
      break
    }
    case 'MAINTAINER': {
      state.labels.set('maintainer', argsExpanded.trim())
      break
    }
    default:
      ctx.log(`  (skipping unsupported instruction: ${inst.instruction})`)
  }
}

function applyCopy(inst: DockerInstruction, state: BuildState, rootfs: string, ctx: ApplyCtx): void {
  const arr = parseExecForm(inst.args)
  const parts = arr ?? expand(inst.args, state).split(/\s+/).filter(Boolean)
  if (parts.length < 2)
    return
  const dest = parts[parts.length - 1]
  const srcs = parts.slice(0, -1)

  const fromStage = inst.flags.from
  const destAbs = resolveInRootfs(rootfs, state.workdir, dest)
  const destIsDir = dest.endsWith('/') || srcs.length > 1

  // `COPY --from=stage` (or another image) copies from that stage's rootfs and
  // is not subject to the build-context freezer.
  if (fromStage && ctx.stageRootfs.has(fromStage)) {
    const srcRoot = ctx.stageRootfs.get(fromStage)!
    if (destIsDir)
      fs.mkdirSync(destAbs, { recursive: true })
    for (const src of srcs) {
      const srcAbs = path.join(srcRoot, src)
      if (!fs.existsSync(srcAbs)) {
        ctx.log(`  COPY --from: source not found, skipping: ${src}`)
        continue
      }
      const target = destIsDir ? path.join(destAbs, path.basename(src)) : destAbs
      copyEntry(srcAbs, target)
    }
    return
  }

  // Copy from the build context using the already freezer-filtered entries so
  // ignored files never make it into a layer — even for `COPY . /app`.
  for (const src of srcs) {
    const norm = src.replace(/^\.\/?/, '').replace(/\/+$/, '')
    const prefix = norm === '' ? '' : `${norm}/`

    // Single-file source?
    const fileEntry = ctx.contextEntries.find(e => !e.isDir && e.relPath === norm)
    if (fileEntry) {
      const target = destIsDir ? path.join(destAbs, path.basename(norm)) : destAbs
      copyEntry(fileEntry.absPath, target)
      continue
    }

    // Directory source: copy its CONTENTS into dest (Docker semantics).
    const members = ctx.contextEntries.filter(e =>
      e.relPath !== norm && (prefix === '' ? true : e.relPath.startsWith(prefix)),
    )
    if (members.length === 0) {
      ctx.log(`  COPY: source not found or empty, skipping: ${src}`)
      continue
    }
    fs.mkdirSync(destAbs, { recursive: true })
    for (const e of members) {
      const rel = prefix === '' ? e.relPath : e.relPath.slice(prefix.length)
      const target = path.join(destAbs, rel)
      if (e.isDir)
        fs.mkdirSync(target, { recursive: true })
      else
        copyEntry(e.absPath, target)
    }
  }
}

function applyRun(inst: DockerInstruction, state: BuildState, rootfs: string, ctx: ApplyCtx): void {
  if (ctx.runMode === 'skip') {
    ctx.log(`  RUN (skipped): ${inst.args}`)
    return
  }

  const execArr = parseExecForm(inst.args)
  const env = { ...process.env, ...Object.fromEntries(state.env) } as Record<string, string>
  const workdirInRootfs = path.join(rootfs, state.workdir)
  fs.mkdirSync(workdirInRootfs, { recursive: true })

  if (ctx.runMode === 'chroot') {
    // Isolated: run inside the rootfs. cd into WORKDIR first for shell form.
    const command = execArr
      ? execArr
      : [...state.shell, `cd ${state.workdir} 2>/dev/null; ${expand(inst.args, state)}`]
    ctx.log(`  RUN ${execArr ? execArr.join(' ') : inst.args}`)
    execFileSync('chroot', [rootfs, ...command], { stdio: 'inherit', env })
    return
  }

  // Host mode: no isolation; cwd is the rootfs WORKDIR. Useful on dev machines
  // for context-only steps, but RUN sees the host filesystem outside WORKDIR.
  ctx.log(`  RUN (host) ${execArr ? execArr.join(' ') : inst.args}`)
  if (execArr)
    execFileSync(execArr[0], execArr.slice(1), { cwd: workdirInRootfs, stdio: 'inherit', env })
  else
    execFileSync(state.shell[0], [...state.shell.slice(1), expand(inst.args, state)], { cwd: workdirInRootfs, stdio: 'inherit', env })
}
