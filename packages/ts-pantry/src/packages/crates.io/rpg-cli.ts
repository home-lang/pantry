/**
 * **rpg-cli** - Your filesystem as a dungeon!
 *
 * @domain `crates.io/rpg-cli`
 * @programs `rpg-cli`
 * @version `1.2.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/rpg-cli`
 * @homepage https://olano.dev/blog/deconstructing-the-role-playing-videogame/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiorpgcli
 * console.log(pkg.name)        // "rpg-cli"
 * console.log(pkg.description) // "Your filesystem as a dungeon!"
 * console.log(pkg.programs)    // ["rpg-cli"]
 * console.log(pkg.versions[0]) // "1.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/rpg-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiorpgcliPackage = {
  /**
  * The display name of this package.
  */
  name: 'rpg-cli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/rpg-cli' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Your filesystem as a dungeon!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/rpg-cli/package.yml' as const,
  homepageUrl: 'https://olano.dev/blog/deconstructing-the-role-playing-videogame/' as const,
  githubUrl: 'https://github.com/facundoolano/rpg-cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/rpg-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/rpg-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/rpg-cli' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rpg-cli',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.0',
    '1.0.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiorpgcliPackage = typeof cratesiorpgcliPackage
