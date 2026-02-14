/**
 * **volta** - JavaScript toolchain manager for reproducible environments
 *
 * @domain `volta.sh`
 * @programs `volta`
 * @version `2.0.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install volta.sh`
 * @homepage https://volta.sh
 * @dependencies `linux:curl.se/ca-certs` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.voltash
 * console.log(pkg.name)        // "volta"
 * console.log(pkg.description) // "JavaScript toolchain manager for reproducible e..."
 * console.log(pkg.programs)    // ["volta"]
 * console.log(pkg.versions[0]) // "2.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/volta-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const voltashPackage = {
  /**
  * The display name of this package.
  */
  name: 'volta' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'volta.sh' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'JavaScript toolchain manager for reproducible environments' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/volta.sh/package.yml' as const,
  homepageUrl: 'https://volta.sh' as const,
  githubUrl: 'https://github.com/volta-cli/volta' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install volta.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +volta.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install volta.sh' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'volta',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:curl.se/ca-certs',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.1.1',
  ] as const,
  aliases: [] as const,
}

export type VoltashPackage = typeof voltashPackage
