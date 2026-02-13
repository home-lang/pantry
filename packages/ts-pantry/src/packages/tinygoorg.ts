/**
 * **tinygo** - Go compiler for small places. Microcontrollers, WebAssembly (WASM/WASI), and command-line tools. Based on LLVM.
 *
 * @domain `tinygo.org`
 * @programs `tinygo`
 * @version `0.40.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tinygo.org`
 * @homepage https://tinygo.org
 * @dependencies `go.dev`
 * @buildDependencies `go.dev@^1.18`, `cmake.org@3`, `nodejs.org`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tinygoorg
 * console.log(pkg.name)        // "tinygo"
 * console.log(pkg.description) // "Go compiler for small places. Microcontrollers,..."
 * console.log(pkg.programs)    // ["tinygo"]
 * console.log(pkg.versions[0]) // "0.40.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tinygo-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tinygoorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'tinygo' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tinygo.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Go compiler for small places. Microcontrollers, WebAssembly (WASM/WASI), and command-line tools. Based on LLVM.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tinygo.org/package.yml' as const,
  homepageUrl: 'https://tinygo.org' as const,
  githubUrl: 'https://github.com/tinygo-org/tinygo' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tinygo.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tinygo.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tinygo.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tinygo',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'go.dev',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
    'cmake.org@3',
    'nodejs.org',
    'python.org@>=3.6',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.40.1',
    '0.40.0',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.2',
  ] as const,
  aliases: [] as const,
}

export type TinygoorgPackage = typeof tinygoorgPackage
