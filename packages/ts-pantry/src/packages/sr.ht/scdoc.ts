/**
 * **scdoc** - pkgx package
 *
 * @domain `sr.ht/scdoc`
 * @version `1.11.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sr.ht/scdoc`
 * @buildDependencies `gnu.org/diffutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.srhtscdoc
 * console.log(pkg.name)        // "scdoc"
 * console.log(pkg.versions[0]) // "1.11.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sr-ht/scdoc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const srhtscdocPackage = {
  /**
  * The display name of this package.
  */
  name: 'scdoc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sr.ht/scdoc' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sr.ht/scdoc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sr.ht/scdoc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sr.ht/scdoc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sr.ht/scdoc' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/diffutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.11.4',
  ] as const,
  aliases: [] as const,
}

export type SrhtscdocPackage = typeof srhtscdocPackage
