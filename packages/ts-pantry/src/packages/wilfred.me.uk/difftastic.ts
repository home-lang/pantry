/**
 * **difft** - a structural diff that understands syntax 🟥🟩
 *
 * @domain `wilfred.me.uk/difftastic`
 * @programs `difft`
 * @version `0.67.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wilfred.me.uk/difftastic`
 * @homepage https://difftastic.wilfred.me.uk/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wilfredmeukdifftastic
 * console.log(pkg.name)        // "difft"
 * console.log(pkg.description) // "a structural diff that understands syntax 🟥🟩"
 * console.log(pkg.programs)    // ["difft"]
 * console.log(pkg.versions[0]) // "0.67.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wilfred-me-uk/difftastic.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const wilfredmeukdifftasticPackage = {
  /**
  * The display name of this package.
  */
  name: 'difft' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'wilfred.me.uk/difftastic' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'a structural diff that understands syntax 🟥🟩' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wilfred.me.uk/difftastic/package.yml' as const,
  homepageUrl: 'https://difftastic.wilfred.me.uk/' as const,
  githubUrl: 'https://github.com/Wilfred/difftastic' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install wilfred.me.uk/difftastic' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wilfred.me.uk/difftastic -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wilfred.me.uk/difftastic' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'difft',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.67.0',
    '0.65.0',
    '0.64.0',
    '0.63.0',
    '0.62.0',
    '0.61.0',
    '0.60.0',
    '0.59.0',
    '0.58.0',
    '0.57.0',
    '0.56.1',
  ] as const,
  aliases: [] as const,
}

export type WilfredmeukdifftasticPackage = typeof wilfredmeukdifftasticPackage
