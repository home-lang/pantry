/**
 * **wasmer** - 🚀 Fast, secure, lightweight containers based on WebAssembly
 *
 * @domain `wasmer.io`
 * @programs `wasmer`
 * @version `7.0.1` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wasmer.io`
 * @homepage https://wasmer.io
 * @dependencies `linux:sourceware.org/libffi` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `nodejs.org@^18`, `gnu.org/make@^4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wasmerio
 * console.log(pkg.name)        // "wasmer"
 * console.log(pkg.description) // "🚀 Fast, secure, lightweight containers based o..."
 * console.log(pkg.programs)    // ["wasmer"]
 * console.log(pkg.versions[0]) // "7.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wasmer-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const wasmerioPackage = {
  /**
  * The display name of this package.
  */
  name: 'wasmer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'wasmer.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🚀 Fast, secure, lightweight containers based on WebAssembly' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wasmer.io/package.yml' as const,
  homepageUrl: 'https://wasmer.io' as const,
  githubUrl: 'https://github.com/wasmerio/wasmer' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install wasmer.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wasmer.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wasmer.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'wasmer',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:sourceware.org/libffi',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'nodejs.org@^18',
    'gnu.org/make@^4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.0.1',
    '7.0.0',
    '6.1.0',
    '6.0.1',
    '6.0.0',
    '5.0.4',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0.0',
    '4.4.0',
    '4.3.7',
    '4.3.6',
    '4.3.5',
    '4.3.4',
    '4.3.3',
    '4.3.2',
    '4.3.1',
    '4.3.0',
    '4.2.8',
    '4.2.7',
    '4.2.6',
    '4.2.5',
    '4.2.4',
    '4.2.3',
    '4.2.2',
  ] as const,
  aliases: [] as const,
}

export type WasmerioPackage = typeof wasmerioPackage
