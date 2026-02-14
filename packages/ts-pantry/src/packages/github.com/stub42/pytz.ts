/**
 * **pytz** - pytz Python historical timezone library and database
 *
 * @domain `github.com/stub42/pytz`
 * @version `2025.2.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/stub42/pytz`
 * @dependencies `python.org~3.12`
 * @buildDependencies `linux:gnu.org/gawk`, `linux:rsync.samba.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomstub42pytz
 * console.log(pkg.name)        // "pytz"
 * console.log(pkg.description) // "pytz Python historical timezone library and dat..."
 * console.log(pkg.versions[0]) // "2025.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/stub42/pytz.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pytzPackage = {
  /**
  * The display name of this package.
  */
  name: 'pytz' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/stub42/pytz' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'pytz Python historical timezone library and database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/stub42/pytz/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/stub42/pytz' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/stub42/pytz' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/stub42/pytz -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/stub42/pytz' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.12',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gawk',
    'linux:rsync.samba.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2025.2.0',
    '2025.1.0',
    '2024.2.0',
    '2024.1.0',
  ] as const,
  aliases: [] as const,
}

export type PytzPackage = typeof pytzPackage
