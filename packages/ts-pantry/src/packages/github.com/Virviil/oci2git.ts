/**
 * **oci2git** - pkgx package
 *
 * @domain `github.com/Virviil/oci2git`
 * @version `0.2.5` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Virviil/oci2git`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomvirviiloci2git
 * console.log(pkg.name)        // "oci2git"
 * console.log(pkg.versions[0]) // "0.2.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Virviil/oci2git.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const oci2gitPackage = {
  /**
   * The display name of this package.
   */
  name: 'oci2git' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/Virviil/oci2git' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Virviil/oci2git/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/Virviil/oci2git' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Virviil/oci2git -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Virviil/oci2git' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.2.5',
    '0.2.1',
    '0.2.0',
    '0.1.5',
  ] as const,
  aliases: [] as const,
}

export type Oci2gitPackage = typeof oci2gitPackage
