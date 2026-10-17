import { mkdirSync, realpathSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

interface BuildTool {
  package: string
  version: string
  programs: string[]
}

/** One pin set supplies the action inputs and verifies the resulting binaries. */
export function nativeBuildTools(platform: string): BuildTool[] {
  if (platform !== 'linux' && platform !== 'darwin') throw new Error('Unsupported native publisher platform')
  const tools: BuildTool[] = [
    { package: 'curl.se', version: '8.23.0', programs: ['curl'] },
    { package: 'gnu.org/tar', version: '1.35.0', programs: ['tar'] },
    { package: 'gnu.org/make', version: '4.3.0', programs: ['make'] },
    { package: 'gnu.org/sed', version: '4.10', programs: ['sed'] },
    { package: 'gnu.org/patch', version: '2.8.0', programs: ['patch'] },
    { package: 'freedesktop.org/pkg-config', version: '0.29.2', programs: ['pkg-config'] },
  ]
  if (platform === 'linux') tools.push(
    { package: 'llvm.org', version: '23.1.3', programs: ['clang', 'clang++'] },
    { package: 'gnu.org/binutils', version: '2.46.0', programs: ['ld'] },
    { package: 'nixos.org/patchelf', version: '0.18.0', programs: ['patchelf'] },
  )
  return tools
}

/** Refuse a host executable when the publisher declared a managed build tool. */
export function managedProgram(root: string, name: string, selected: string | null = Bun.which(name)): string {
  const pantry = realpathSync(join(root, 'pantry'))
  const expected = realpathSync(join(pantry, '.bin', name))
  const within = relative(pantry, expected)
  if (within === '..' || within.startsWith(`..${sep}`) || resolve(pantry, within) !== expected)
    throw new Error(`${name}: managed entry points outside the Pantry installation`)
  if (!selected || realpathSync(selected) !== expected)
    throw new Error(`${name}: PATH did not select the declared Pantry executable`)
  return expected
}

function version(program: string): string {
  const result = Bun.spawnSync([program, '--version'], { stdout: 'pipe', stderr: 'pipe' })
  if (result.exitCode !== 0) throw new Error(`${program}: --version exited ${result.exitCode}`)
  const output = Buffer.from(result.stdout).toString().trim()
  if (!output) throw new Error(`${program}: --version returned no identity`)
  return output.split('\n')[0]!
}

export function inspectManagedProgram(root: string, name: string, selected?: string | null, expectedVersion?: string): { name: string, path: string, version: string } {
  const path = managedProgram(root, name, selected)
  const identity = version(path)
  if (expectedVersion) {
    const reported = identity.match(/\b\d+(?:\.\d+){0,3}(?:[-+][A-Za-z0-9.-]+)?/)?.[0]
    const normalized = (value: string) => value.replace(/(?:\.0)+$/, '')
    if (!reported || normalized(reported) !== normalized(expectedVersion))
      throw new Error(`${name}: expected ${expectedVersion}, reported ${identity}`)
  }
  return { name, path, version: identity }
}

if (import.meta.main) {
  const root = process.env.GITHUB_WORKSPACE || process.cwd()
  const tools = nativeBuildTools(process.platform)
  if (process.argv.includes('--packages')) {
    console.log(`packages=${tools.map(tool => `${tool.package}@${tool.version}`).join(' ')}`)
    process.exit(0)
  }
  const programs = tools.flatMap(tool => tool.programs.map(name => inspectManagedProgram(root, name, undefined, tool.version)))
  let appleSdk: { path: string, version: string } | undefined
  if (process.platform === 'darwin') {
    // The native macOS platform supplies Apple's licensed SDK and linker.
    // All additional build tools and recipe dependencies come from Pantry.
    const sdk = Bun.spawnSync(['xcrun', '--sdk', 'macosx', '--find', 'clang'], { stdout: 'pipe', stderr: 'pipe' })
    if (sdk.exitCode !== 0) throw new Error('The native macOS publisher requires an available Apple SDK')
    const path = Buffer.from(sdk.stdout).toString().trim()
    if (!path) throw new Error('The Apple SDK did not identify its compiler')
    appleSdk = { path, version: version(path) }
  }
  const receipt = { platform: `${process.platform}-${process.arch}`, packages: tools.map(tool => `${tool.package}@${tool.version}`), programs, appleSdk }
  const output = join(process.env.RUNNER_TEMP || root, 'pantry-build-diagnostics', 'toolchain.json')
  mkdirSync(dirname(output), { recursive: true })
  await Bun.write(output, `${JSON.stringify(receipt, null, 2)}\n`)
  for (const program of programs) console.log(`${program.name}: ${program.version} (${program.path})`)
  if (appleSdk) console.log(`Apple SDK: ${appleSdk.version} (${appleSdk.path})`)
}
