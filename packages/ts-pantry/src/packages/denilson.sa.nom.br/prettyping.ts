/**
 * **prettyping** - `prettyping` is a wrapper around the standard `ping` tool, making the output prettier, more colorful, more compact, and easier to read.
 *
 * @domain `denilson.sa.nom.br/prettyping`
 * @programs `prettyping`
 * @version `1.1.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install denilson.sa.nom.br/prettyping`
 * @homepage https://denilsonsa.github.io/prettyping/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.denilsonsanombrprettyping
 * console.log(pkg.name)        // "prettyping"
 * console.log(pkg.description) // "`prettyping` is a wrapper around the standard `..."
 * console.log(pkg.programs)    // ["prettyping"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/denilson-sa-nom-br/prettyping.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const denilsonsanombrprettypingPackage = {
  /**
  * The display name of this package.
  */
  name: 'prettyping' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'denilson.sa.nom.br/prettyping' as const,
  /**
  * Brief description of what this package does.
  */
  description: '`prettyping` is a wrapper around the standard `ping` tool, making the output prettier, more colorful, more compact, and easier to read.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/denilson.sa.nom.br/prettyping/package.yml' as const,
  homepageUrl: 'https://denilsonsa.github.io/prettyping/' as const,
  githubUrl: 'https://github.com/denilsonsa/prettyping' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install denilson.sa.nom.br/prettyping' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +denilson.sa.nom.br/prettyping -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install denilson.sa.nom.br/prettyping' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'prettyping',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.0',
    '1.0.1',
  ] as const,
  aliases: [] as const,
}

export type DenilsonsanombrprettypingPackage = typeof denilsonsanombrprettypingPackage
