/**
 * **lolcat** - Rainbows and unicorns in your console!
 *
 * @domain `github.com/jaseg/lolcat`
 * @programs `lolcat`
 * @version `1.5.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jaseg/lolcat`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjaseglolcat
 * console.log(pkg.name)        // "lolcat"
 * console.log(pkg.description) // "Rainbows and unicorns in your console!"
 * console.log(pkg.programs)    // ["lolcat"]
 * console.log(pkg.versions[0]) // "1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jaseg/lolcat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lolcatPackage = {
  /**
   * The display name of this package.
   */
  name: 'lolcat' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/jaseg/lolcat' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Rainbows and unicorns in your console!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jaseg/lolcat/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/busyloop/lolcat' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/jaseg/lolcat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jaseg/lolcat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jaseg/lolcat' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lolcat',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.0',
    '1.4.0',
  ] as const,
  aliases: [] as const,
}

export type LolcatPackage = typeof lolcatPackage
