/**
 * **exa** - A modern replacement for ‘ls’.
 *
 * @domain `crates.io/exa`
 * @programs `exa`
 * @version `0.10.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/exa`
 * @homepage https://the.exa.website/
 * @dependencies `darwin:zlib.net^1` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioexa
 * console.log(pkg.name)        // "exa"
 * console.log(pkg.description) // "A modern replacement for ‘ls’."
 * console.log(pkg.programs)    // ["exa"]
 * console.log(pkg.versions[0]) // "0.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/exa.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioexaPackage = {
  /**
  * The display name of this package.
  */
  name: 'exa' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/exa' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A modern replacement for ‘ls’.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/exa/package.yml' as const,
  homepageUrl: 'https://the.exa.website/' as const,
  githubUrl: 'https://github.com/ogham/exa' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/exa' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/exa -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/exa' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'exa',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'darwin:zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.1',
  ] as const,
  aliases: [] as const,
}

export type CratesioexaPackage = typeof cratesioexaPackage
