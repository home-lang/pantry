/**
 * **epsilon** - Powerful wavelet image compressor
 *
 * @domain `epsilon-project.sourceforge.io`
 * @programs `epsilon`
 * @version `0.9.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install epsilon-project.sourceforge.io`
 * @homepage https://sourceforge.net/projects/epsilon-project/
 * @buildDependencies `gnu.org/make`, `gnu.org/autoconf`, `gnu.org/automake`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.epsilonprojectsourceforgeio
 * console.log(pkg.name)        // "epsilon"
 * console.log(pkg.description) // "Powerful wavelet image compressor"
 * console.log(pkg.programs)    // ["epsilon"]
 * console.log(pkg.versions[0]) // "0.9.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/epsilon-project-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const epsilonprojectsourceforgeioPackage = {
  /**
   * The display name of this package.
   */
  name: 'epsilon' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'epsilon-project.sourceforge.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Powerful wavelet image compressor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/epsilon-project.sourceforge.io/package.yml' as const,
  homepageUrl: 'https://sourceforge.net/projects/epsilon-project/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install epsilon-project.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +epsilon-project.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install epsilon-project.sourceforge.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'epsilon',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.2',
  ] as const,
  aliases: [] as const,
}

export type EpsilonprojectsourceforgeioPackage = typeof epsilonprojectsourceforgeioPackage
