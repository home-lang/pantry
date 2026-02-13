/**
 * **c-ares** - pkgx package
 *
 * @domain `c-ares.org`
 * @version `1.34.6` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install c-ares.org`
 * @buildDependencies `cmake.org@^3`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.caresorg
 * console.log(pkg.name)        // "c-ares"
 * console.log(pkg.versions[0]) // "1.34.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/c-ares-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const caresorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'c-ares' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'c-ares.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/c-ares.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install c-ares.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +c-ares.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install c-ares.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.34.6',
    '1.34.5',
    '1.34.4',
    '1.34.3',
    '1.34.2',
    '1.34.1',
    '1.33.1',
    '1.33.0',
    '1.32.3',
    '1.32.2',
    '1.32.1',
    '1.32.0',
    '1.31.0',
    '1.30.0',
    '1.29.0',
    '1.28.1',
    '1.28.0',
    '1.27.0',
    '1.26.0',
    '1.25.0',
    '1.24.0',
    '1.23.0',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.1',
    '1.20.0',
    '1.19.1',
    '1.19.0',
  ] as const,
  aliases: [] as const,
}

export type CaresorgPackage = typeof caresorgPackage
