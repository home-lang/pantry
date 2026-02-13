/**
 * **fftw** - C routines to compute the Discrete Fourier Transform
 *
 * @domain `fftw.org`
 * @programs `fftw-wisdom`, `fftw-wisdom-to-conf`, `fftwf-wisdom`, `fftwl-wisdom`
 * @version `3.3.10` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fftw.org`
 * @homepage https://fftw.org
 * @dependencies `open-mpi.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fftworg
 * console.log(pkg.name)        // "fftw"
 * console.log(pkg.description) // "C routines to compute the Discrete Fourier Tran..."
 * console.log(pkg.programs)    // ["fftw-wisdom", "fftw-wisdom-to-conf", ...]
 * console.log(pkg.versions[0]) // "3.3.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fftw-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fftworgPackage = {
  /**
   * The display name of this package.
   */
  name: 'fftw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fftw.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'C routines to compute the Discrete Fourier Transform' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fftw.org/package.yml' as const,
  homepageUrl: 'https://fftw.org' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fftw.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fftw.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fftw.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fftw-wisdom',
    'fftw-wisdom-to-conf',
    'fftwf-wisdom',
    'fftwl-wisdom',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'open-mpi.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.3.10',
  ] as const,
  aliases: [] as const,
}

export type FftworgPackage = typeof fftworgPackage
