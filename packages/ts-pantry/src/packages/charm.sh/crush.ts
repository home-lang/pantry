/**
 * **crush** - pkgx package
 *
 * @domain `charm.sh/crush`
 * @version `0.34.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/crush`
 * @buildDependencies `go.dev@=1.25.5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshcrush
 * console.log(pkg.name)        // "crush"
 * console.log(pkg.versions[0]) // "0.34.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/crush.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshcrushPackage = {
  /**
   * The display name of this package.
   */
  name: 'crush' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'charm.sh/crush' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/crush/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install charm.sh/crush' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/crush -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/crush' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@=1.25.5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.34.0',
    '0.33.3',
    '0.33.2',
    '0.32.1',
    '0.32.0',
    '0.31.0',
    '0.30.3',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.1',
    '0.29.0',
    '0.28.0',
    '0.27.0',
    '0.26.0',
    '0.25.0',
    '0.24.0',
  ] as const,
  aliases: [] as const,
}

export type CharmshcrushPackage = typeof charmshcrushPackage
