import assert from 'node:assert/strict'
import { copyFile, mkdir, mkdtemp, realpath, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const artifacts = join(import.meta.dir, '../../artifacts/native-runtime-smoke')
await mkdir(artifacts, { recursive: true })
const work = await mkdtemp(join(tmpdir(), 'pantry-native-runtime-smoke-'))
const target = new URL(process.env.PANTRY_RUNTIME_SMOKE_URL || 'https://pantry.dev/')
assert.equal(target.protocol, 'https:')
assert(!target.username && !target.password, 'Use a public HTTPS URL without inline credentials')
const expectedPantry = process.env.PANTRY_RUNTIME_SMOKE_PANTRY_VERSION || '0.11.91'
assert(/^\d+\.\d+\.\d+$/.test(expectedPantry), 'Use an exact published Pantry version')
const checks: Record<string, unknown> = { target: target.href, platform: process.platform, architecture: process.arch }
const env = { ...process.env }
// Exercise the artifact's own loader paths, independent of an activated SDK.
delete env.LD_LIBRARY_PATH
delete env.LD_PRELOAD

async function run(name: string, command: string[], timeout = 60_000): Promise<string> {
  const child = Bun.spawn(command, { cwd: work, env, stdout: 'pipe', stderr: 'pipe' })
  const timer = setTimeout(() => child.kill(), timeout)
  try {
    const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
    assert.equal(code, 0, `${name} exited ${code}: ${stderr.slice(-2000)}`)
    return stdout
  }
  finally { clearTimeout(timer) }
}

async function tool(name: string): Promise<string> {
  const path = await realpath(join(work, 'pantry/.bin', name))
  assert(path.startsWith(`${work}/pantry/`), `${name} escaped the fresh installation: ${path}`)
  return path
}

try {
  assert.equal(process.platform, 'linux')
  assert.equal(process.arch, 'x64')
  await copyFile(join(import.meta.dir, '../native-runtime-smoke/pantry.json'), join(work, 'pantry.json'))
  const pantry = Bun.which('pantry')
  assert(pantry, 'The published Pantry CLI must be installed by the action')
  checks.pantry = (await run('pantry-version', [pantry, '--version'])).trim()
  assert.equal((checks.pantry as string).split(/\s+/).slice(0, 2).join(' '), `pantry ${expectedPantry}`)
  await run('install', [pantry, 'install', '--no-save'], 15 * 60_000)
  env.PATH = `${work}/pantry/.bin:${env.PATH}`
  const paths = Object.fromEntries(await Promise.all(['bun', 'google-chrome-stable', 'ffmpeg', 'ffprobe', 'yt-dlp', 'python3'].map(async name => [name, await tool(name)])))
  checks.programs = paths
  checks.programModes = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([name, path]) => [name, ((await stat(path)).mode & 0o777).toString(8)])))
  assert.match(await run('bun-version', [paths.bun, '--version']), /^1\.4\.3\s*$/)
  assert.match(await run('chrome-version', [paths['google-chrome-stable'], '--version']), /155\.0\.8059\.84/)
  assert.match(await run('ffmpeg-version', [paths.ffmpeg, '-version']), /ffmpeg version 8\.1/)
  checks.python = JSON.parse(await run('python-runtime', [paths.python3, '-c', 'import sys, ssl, decimal, ctypes, sqlite3, bz2, lzma, json; print(json.dumps({"version": sys.version, "minor": sys.version_info.minor, "major": sys.version_info.major}))']))
  assert.equal((checks.python as { major: number }).major, 3)
  assert.equal((checks.python as { minor: number }).minor, 14)
  assert.match(await run('yt-dlp-version', [paths['yt-dlp'], '--version']), /^2026\.0?3\.17\s*$/)
  const video = join(work, 'fixture.mp4')
  await run('encode', [paths.ffmpeg, '-y', '-f', 'lavfi', '-i', 'color=c=blue:size=16x16:rate=4', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '0.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', video])
  const streams = JSON.parse(await run('probe', [paths.ffprobe, '-v', 'error', '-show_entries', 'stream=codec_name', '-of', 'json', video])).streams as Array<{ codec_name: string }>
  assert(streams.some(stream => stream.codec_name === 'h264'))
  assert(streams.some(stream => stream.codec_name === 'aac'))
  checks.codecs = streams
  // Run WebView with the freshly installed Bun, not the bootstrap runtime.
  env.PANTRY_RUNTIME_SMOKE_URL = target.href
  env.PANTRY_RUNTIME_SMOKE_CHROME = paths['google-chrome-stable']
  env.PANTRY_RUNTIME_SMOKE_ARTIFACTS = artifacts
  await run('browser', [paths.bun, join(import.meta.dir, 'native-browser-smoke.ts')], 90_000)
  checks.browser = await Bun.file(join(artifacts, 'browser.json')).json()
  checks.passed = true
}
finally {
  await rm(work, { recursive: true, force: true })
  checks.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(checks, null, 2) + '\n')
}
