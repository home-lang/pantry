/**
 * **ogg** - pkgx package
 *
 * @domain `xiph.org/ogg`
 * @version `1.3.6` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xiph.org/ogg`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xiphorgogg
 * console.log(pkg.name)        // "ogg"
 * console.log(pkg.versions[0]) // "1.3.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xiph-org/ogg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xiphorgoggPackage = {
  /**
  * The display name of this package.
  */
  name: 'ogg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'xiph.org/ogg' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/ogg/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install xiph.org/ogg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xiph.org/ogg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xiph.org/ogg' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.6',
    '1.3.5',
  ] as const,
  aliases: [] as const,
}

export type XiphorgoggPackage = typeof xiphorgoggPackage
