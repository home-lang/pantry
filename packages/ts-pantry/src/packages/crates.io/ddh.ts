/**
 * **ddh** - A fast duplicate file finder
 *
 * @domain `crates.io/ddh`
 * @programs `ddh`
 * @version `0.13.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/ddh`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioddh
 * console.log(pkg.name)        // "ddh"
 * console.log(pkg.description) // "A fast duplicate file finder"
 * console.log(pkg.programs)    // ["ddh"]
 * console.log(pkg.versions[0]) // "0.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/ddh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioddhPackage = {
  /**
   * The display name of this package.
   */
  name: 'ddh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/ddh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A fast duplicate file finder' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/ddh/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/darakian/ddh' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/ddh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/ddh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/ddh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ddh',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.13.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioddhPackage = typeof cratesioddhPackage
