/**
 * **mpdecimal** - pkgx package
 *
 * @domain `bytereef.org/mpdecimal`
 * @version `4.0.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install bytereef.org/mpdecimal`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.bytereeforgmpdecimal
 * console.log(pkg.name)        // "mpdecimal"
 * console.log(pkg.versions[0]) // "4.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/bytereef-org/mpdecimal.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bytereeforgmpdecimalPackage = {
  /**
   * The display name of this package.
   */
  name: 'mpdecimal' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'bytereef.org/mpdecimal' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bytereef.org/mpdecimal/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install bytereef.org/mpdecimal' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bytereef.org/mpdecimal -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install bytereef.org/mpdecimal' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.0.1',
    '4.0.0',
    '2.5.1',
    '2.5.0',
    '2.4.2',
  ] as const,
  aliases: [] as const,
}

export type BytereeforgmpdecimalPackage = typeof bytereeforgmpdecimalPackage
