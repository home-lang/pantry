/**
 * **elvish** - Powerful scripting language & versatile interactive shell
 *
 * @domain `elv.sh`
 * @programs `elvish`
 * @version `0.21.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install elv.sh`
 * @homepage https://elv.sh/
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.elvsh
 * console.log(pkg.name)        // "elvish"
 * console.log(pkg.description) // "Powerful scripting language & versatile interac..."
 * console.log(pkg.programs)    // ["elvish"]
 * console.log(pkg.versions[0]) // "0.21.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/elv-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const elvshPackage = {
  /**
  * The display name of this package.
  */
  name: 'elvish' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'elv.sh' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Powerful scripting language & versatile interactive shell' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/elv.sh/package.yml' as const,
  homepageUrl: 'https://elv.sh/' as const,
  githubUrl: 'https://github.com/elves/elvish' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install elv.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +elv.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install elv.sh' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'elvish',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.21.0',
    '0.20.1',
    '0.20.0',
    '0.19.2',
  ] as const,
  aliases: [] as const,
}

export type ElvshPackage = typeof elvshPackage
