/**
 * **pwgen** - Password generator
 *
 * @domain `pwgen.sourceforge.io`
 * @programs `pwgen`
 * @version `2.8.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pwgen.sourceforge.io`
 * @homepage https://pwgen.sourceforge.net/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pwgensourceforgeio
 * console.log(pkg.name)        // "pwgen"
 * console.log(pkg.description) // "Password generator"
 * console.log(pkg.programs)    // ["pwgen"]
 * console.log(pkg.versions[0]) // "2.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pwgen-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pwgensourceforgeioPackage = {
  /**
  * The display name of this package.
  */
  name: 'pwgen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pwgen.sourceforge.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Password generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pwgen.sourceforge.io/package.yml' as const,
  homepageUrl: 'https://pwgen.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install pwgen.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pwgen.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pwgen.sourceforge.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pwgen',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.8.0',
  ] as const,
  aliases: [] as const,
}

export type PwgensourceforgeioPackage = typeof pwgensourceforgeioPackage
