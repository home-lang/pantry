/**
 * **frei0r.dyne** - pkgx package
 *
 * @domain `frei0r.dyne.org`
 * @version `1.8.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install frei0r.dyne.org`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.frei0rdyneorg
 * console.log(pkg.name)        // "frei0r.dyne"
 * console.log(pkg.versions[0]) // "1.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/frei0r-dyne-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const frei0rdyneorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'frei0r.dyne' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'frei0r.dyne.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/frei0r.dyne.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install frei0r.dyne.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +frei0r.dyne.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install frei0r.dyne.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.8.0',
  ] as const,
  aliases: [] as const,
}

export type Frei0rdyneorgPackage = typeof frei0rdyneorgPackage
