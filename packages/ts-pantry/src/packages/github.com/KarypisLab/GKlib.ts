/**
 * **GKlib** - A library of various helper routines and frameworks used by many of the lab's software
 *
 * @domain `github.com/KarypisLab/GKlib`
 * @programs `cmpnbrs`, `csrcnv`, `fis`, `gkgraph`, `gkrw`, ... (+1 more)
 * @version `5.1.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/KarypisLab/GKlib`
 * @buildDependencies `gnu.org/make`, `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkarypislabgklib
 * console.log(pkg.name)        // "GKlib"
 * console.log(pkg.description) // "A library of various helper routines and framew..."
 * console.log(pkg.programs)    // ["cmpnbrs", "csrcnv", ...]
 * console.log(pkg.versions[0]) // "5.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/KarypisLab/GKlib.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gklibPackage = {
  /**
   * The display name of this package.
   */
  name: 'GKlib' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/KarypisLab/GKlib' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A library of various helper routines and frameworks used by many of the lab\'s software' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/KarypisLab/GKlib/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/KarypisLab/GKlib' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/KarypisLab/GKlib' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/KarypisLab/GKlib -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/KarypisLab/GKlib' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cmpnbrs',
    'csrcnv',
    'fis',
    'gkgraph',
    'gkrw',
    'm2mnbrs',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.1',
  ] as const,
  aliases: [] as const,
}

export type GklibPackage = typeof gklibPackage
