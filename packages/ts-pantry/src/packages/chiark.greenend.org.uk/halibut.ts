/**
 * **halibut** - Yet another free document preparation system
 *
 * @domain `chiark.greenend.org.uk/halibut`
 * @programs `halibut`
 * @version `1.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install chiark.greenend.org.uk/halibut`
 * @homepage https://www.chiark.greenend.org.uk/~sgtatham/halibut/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.chiarkgreenendorgukhalibut
 * console.log(pkg.name)        // "halibut"
 * console.log(pkg.description) // "Yet another free document preparation system"
 * console.log(pkg.programs)    // ["halibut"]
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/chiark-greenend-org-uk/halibut.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const chiarkgreenendorgukhalibutPackage = {
  /**
   * The display name of this package.
   */
  name: 'halibut' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'chiark.greenend.org.uk/halibut' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Yet another free document preparation system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/chiark.greenend.org.uk/halibut/package.yml' as const,
  homepageUrl: 'https://www.chiark.greenend.org.uk/~sgtatham/halibut/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install chiark.greenend.org.uk/halibut' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +chiark.greenend.org.uk/halibut -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install chiark.greenend.org.uk/halibut' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'halibut',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.0',
  ] as const,
  aliases: [] as const,
}

export type ChiarkgreenendorgukhalibutPackage = typeof chiarkgreenendorgukhalibutPackage
