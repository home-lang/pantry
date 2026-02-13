/**
 * **mergiraf** - Syntax-aware git merge driver
 *
 * @domain `mergiraf.org`
 * @programs `mergiraf`
 * @version `0.16.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mergiraf.org`
 * @homepage https://mergiraf.org
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mergiraforg
 * console.log(pkg.name)        // "mergiraf"
 * console.log(pkg.description) // "Syntax-aware git merge driver"
 * console.log(pkg.programs)    // ["mergiraf"]
 * console.log(pkg.versions[0]) // "0.16.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mergiraf-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mergiraforgPackage = {
  /**
   * The display name of this package.
   */
  name: 'mergiraf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mergiraf.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Syntax-aware git merge driver' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mergiraf.org/package.yml' as const,
  homepageUrl: 'https://mergiraf.org' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mergiraf.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mergiraf.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mergiraf.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mergiraf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.16.1',
    '0.15.0',
    '0.14.0',
    '0.13.0',
    '0.12.1',
    '0.12.0',
    '0.11.0',
    '0.10.0',
  ] as const,
  aliases: [] as const,
}

export type MergiraforgPackage = typeof mergiraforgPackage
