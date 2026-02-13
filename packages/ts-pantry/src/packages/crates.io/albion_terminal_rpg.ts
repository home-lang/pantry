/**
 * **albionrpg** - A text-based RPG for the Terminal, written in Rust.
 *
 * @domain `crates.io/albion_terminal_rpg`
 * @programs `albionrpg`
 * @version `2024.5.7` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/albion_terminal_rpg`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioalbion_terminal_rpg
 * console.log(pkg.name)        // "albionrpg"
 * console.log(pkg.description) // "A text-based RPG for the Terminal, written in R..."
 * console.log(pkg.programs)    // ["albionrpg"]
 * console.log(pkg.versions[0]) // "2024.5.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/albion_terminal_rpg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioalbion_terminal_rpgPackage = {
  /**
   * The display name of this package.
   */
  name: 'albionrpg' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/albion_terminal_rpg' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A text-based RPG for the Terminal, written in Rust.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/albion_terminal_rpg/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/rmj1001/albion-rpg' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/albion_terminal_rpg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/albion_terminal_rpg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/albion_terminal_rpg' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'albionrpg',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2024.5.7',
  ] as const,
  aliases: [] as const,
}

export type Cratesioalbion_terminal_rpgPackage = typeof cratesioalbion_terminal_rpgPackage
