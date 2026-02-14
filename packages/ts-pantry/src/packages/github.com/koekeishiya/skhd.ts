/**
 * **skhd** - Simple hotkey daemon for macOS
 *
 * @domain `github.com/koekeishiya/skhd`
 * @programs `skhd`
 * @version `0.3.9` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/koekeishiya/skhd`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkoekeishiyaskhd
 * console.log(pkg.name)        // "skhd"
 * console.log(pkg.description) // " Simple hotkey daemon for macOS"
 * console.log(pkg.programs)    // ["skhd"]
 * console.log(pkg.versions[0]) // "0.3.9" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/koekeishiya/skhd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const skhdPackage = {
  /**
  * The display name of this package.
  */
  name: 'skhd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/koekeishiya/skhd' as const,
  /**
  * Brief description of what this package does.
  */
  description: ' Simple hotkey daemon for macOS' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/koekeishiya/skhd/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/koekeishiya/skhd' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/koekeishiya/skhd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/koekeishiya/skhd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/koekeishiya/skhd' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'skhd',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.9',
  ] as const,
  aliases: [] as const,
}

export type SkhdPackage = typeof skhdPackage
