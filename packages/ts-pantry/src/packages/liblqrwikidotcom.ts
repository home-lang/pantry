/**
 * **liblqr.wikidot** - Liquid Rescale library
 *
 * @domain `liblqr.wikidot.com`
 * @version `0.4.3` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install liblqr.wikidot.com`
 * @dependencies `gnome.org/glib`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.liblqrwikidotcom
 * console.log(pkg.name)        // "liblqr.wikidot"
 * console.log(pkg.description) // "Liquid Rescale library"
 * console.log(pkg.versions[0]) // "0.4.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/liblqr-wikidot-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const liblqrwikidotcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'liblqr.wikidot' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'liblqr.wikidot.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Liquid Rescale library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/liblqr.wikidot.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/carlobaldassi/liblqr' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install liblqr.wikidot.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +liblqr.wikidot.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install liblqr.wikidot.com' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.3',
    '0.4.2',
  ] as const,
  aliases: [] as const,
}

export type LiblqrwikidotcomPackage = typeof liblqrwikidotcomPackage
