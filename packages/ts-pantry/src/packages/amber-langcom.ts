/**
 * **amber** - Crystal web framework. Bare metal performance, productivity and happiness
 *
 * @domain `amber-lang.com`
 * @programs `amber`
 * @version `0.5.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install amber-lang.com`
 * @homepage https://amberframework.org/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.amberlangcom
 * console.log(pkg.name)        // "amber"
 * console.log(pkg.description) // "Crystal web framework. Bare metal performance, ..."
 * console.log(pkg.programs)    // ["amber"]
 * console.log(pkg.versions[0]) // "0.5.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/amber-lang-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const amberlangcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'amber' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'amber-lang.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Crystal web framework. Bare metal performance, productivity and happiness' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/amber-lang.com/package.yml' as const,
  homepageUrl: 'https://amberframework.org/' as const,
  githubUrl: 'https://github.com/Ph0enixKM/Amber' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install amber-lang.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +amber-lang.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install amber-lang.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'amber',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.1',
    '0.5.0',
    '0.4.0',
    '0.3.5',
    '0.3.4',
    '0.3.3',
    '0.3.2',
    '0.3.1',
  ] as const,
  aliases: [] as const,
}

export type AmberlangcomPackage = typeof amberlangcomPackage
