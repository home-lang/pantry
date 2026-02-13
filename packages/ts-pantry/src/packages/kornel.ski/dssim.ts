/**
 * **dssim** - Image similarity comparison simulating human perception (multiscale SSIM in Rust)
 *
 * @domain `kornel.ski/dssim`
 * @programs `dssim`
 * @version `3.4.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kornel.ski/dssim`
 * @homepage https://kornel.ski/dssim
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kornelskidssim
 * console.log(pkg.name)        // "dssim"
 * console.log(pkg.description) // "Image similarity comparison simulating human pe..."
 * console.log(pkg.programs)    // ["dssim"]
 * console.log(pkg.versions[0]) // "3.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kornel-ski/dssim.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kornelskidssimPackage = {
  /**
   * The display name of this package.
   */
  name: 'dssim' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'kornel.ski/dssim' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Image similarity comparison simulating human perception (multiscale SSIM in Rust)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kornel.ski/dssim/package.yml' as const,
  homepageUrl: 'https://kornel.ski/dssim' as const,
  githubUrl: 'https://github.com/kornelski/dssim' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install kornel.ski/dssim' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kornel.ski/dssim -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kornel.ski/dssim' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dssim',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.4.0',
    '3.2.3',
  ] as const,
  aliases: [] as const,
}

export type KornelskidssimPackage = typeof kornelskidssimPackage
