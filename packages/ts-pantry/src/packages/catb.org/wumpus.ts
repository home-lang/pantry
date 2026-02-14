/**
 * **wumpus** - Exact clone of the ancient BASIC Hunt the Wumpus game
 *
 * @domain `catb.org/wumpus`
 * @programs `wumpus`, `superhack`
 * @version `1.10.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install catb.org/wumpus`
 * @homepage http://www.catb.org/~esr/wumpus/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.catborgwumpus
 * console.log(pkg.name)        // "wumpus"
 * console.log(pkg.description) // "Exact clone of the ancient BASIC Hunt the Wumpu..."
 * console.log(pkg.programs)    // ["wumpus", "superhack"]
 * console.log(pkg.versions[0]) // "1.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/catb-org/wumpus.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const catborgwumpusPackage = {
  /**
  * The display name of this package.
  */
  name: 'wumpus' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'catb.org/wumpus' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Exact clone of the ancient BASIC Hunt the Wumpus game' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/catb.org/wumpus/package.yml' as const,
  homepageUrl: 'http://www.catb.org/~esr/wumpus/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install catb.org/wumpus' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +catb.org/wumpus -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install catb.org/wumpus' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'wumpus',
    'superhack',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.6.0',
    '1.5.0',
    '1.4.0',
  ] as const,
  aliases: [] as const,
}

export type CatborgwumpusPackage = typeof catborgwumpusPackage
