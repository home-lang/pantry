/**
 * **Scriptisto** - A language-agnostic "shebang interpreter" that enables you to write scripts in compiled languages.
 *
 * @domain `github.com/igor-petruk/scriptisto`
 * @programs `scriptisto`
 * @version `2.2.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/igor-petruk/scriptisto`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomigorpetrukscriptisto
 * console.log(pkg.name)        // "Scriptisto"
 * console.log(pkg.description) // "A language-agnostic "shebang interpreter" that ..."
 * console.log(pkg.programs)    // ["scriptisto"]
 * console.log(pkg.versions[0]) // "2.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/igor-petruk/scriptisto.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const scriptistoPackage = {
  /**
  * The display name of this package.
  */
  name: 'Scriptisto' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/igor-petruk/scriptisto' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A language-agnostic "shebang interpreter" that enables you to write scripts in compiled languages.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/igor-petruk/scriptisto/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/igor-petruk/scriptisto' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/igor-petruk/scriptisto' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/igor-petruk/scriptisto -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/igor-petruk/scriptisto' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'scriptisto',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.2.0',
    '2.1.1',
  ] as const,
  aliases: [] as const,
}

export type ScriptistoPackage = typeof scriptistoPackage
