/**
 * **liblinear** - LIBLINEAR -- A Library for Large Linear Classification
 *
 * @domain `csie.ntu.edu.tw/cjlin/liblinear`
 * @programs `predict`, `train`
 * @version `2.50.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install csie.ntu.edu.tw/cjlin/liblinear`
 * @homepage https://www.csie.ntu.edu.tw/~cjlin/liblinear/
 * @buildDependencies `gnu.org/make`, `curl.se`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.csientuedutwcjlinliblinear
 * console.log(pkg.name)        // "liblinear"
 * console.log(pkg.description) // "LIBLINEAR -- A Library for Large Linear Classif..."
 * console.log(pkg.programs)    // ["predict", "train"]
 * console.log(pkg.versions[0]) // "2.50.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/csie-ntu-edu-tw/cjlin/liblinear.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const csientuedutwcjlinliblinearPackage = {
  /**
   * The display name of this package.
   */
  name: 'liblinear' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'csie.ntu.edu.tw/cjlin/liblinear' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'LIBLINEAR -- A Library for Large Linear Classification' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/csie.ntu.edu.tw/cjlin/liblinear/package.yml' as const,
  homepageUrl: 'https://www.csie.ntu.edu.tw/~cjlin/liblinear/' as const,
  githubUrl: 'https://github.com/cjlin1/liblinear' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install csie.ntu.edu.tw/cjlin/liblinear' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +csie.ntu.edu.tw/cjlin/liblinear -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install csie.ntu.edu.tw/cjlin/liblinear' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'predict',
    'train',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
    'curl.se',
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.50.0',
    '2.49.0',
    '2.48.0',
    '2.47.0',
  ] as const,
  aliases: [] as const,
}

export type CsientuedutwcjlinliblinearPackage = typeof csientuedutwcjlinliblinearPackage
