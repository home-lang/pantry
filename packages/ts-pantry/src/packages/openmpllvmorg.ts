/**
 * **libomp** - The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.
 *
 * @domain `openmp.llvm.org`
 * @version `21.1.8` (43 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openmp.llvm.org`
 * @homepage http://llvm.org
 * @buildDependencies `cmake.org`, `llvm.org`, `gnu.org/wget`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openmpllvmorg
 * console.log(pkg.name)        // "libomp"
 * console.log(pkg.description) // "The LLVM Project is a collection of modular and..."
 * console.log(pkg.versions[0]) // "21.1.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openmp-llvm-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openmpllvmorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libomp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openmp.llvm.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openmp.llvm.org/package.yml' as const,
  homepageUrl: 'http://llvm.org' as const,
  githubUrl: 'https://github.com/llvm/llvm-project' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openmp.llvm.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openmp.llvm.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openmp.llvm.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'llvm.org',
    'gnu.org/wget',
    'linux:python.org@~3.11',
    'linux:perl.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '21.1.8',
    '21.1.7',
    '21.1.6',
    '21.1.5',
    '21.1.4',
    '21.1.3',
    '21.1.2',
    '21.1.1',
    '21.1.0',
    '20.1.8',
    '20.1.7',
    '20.1.6',
    '20.1.5',
    '20.1.4',
    '20.1.3',
    '20.1.2',
    '20.1.1',
    '20.1.0',
    '19.1.7',
    '19.1.6',
    '19.1.5',
    '19.1.4',
    '19.1.3',
    '19.1.2',
    '19.1.1',
    '19.1.0',
    '18.1.8',
    '18.1.7',
    '18.1.6',
    '18.1.5',
    '18.1.4',
    '18.1.3',
    '18.1.2',
    '18.1.1',
    '18.1.0',
    '17.0.6',
    '17.0.5',
    '17.0.4',
    '17.0.3',
    '17.0.2',
    '17.0.1',
    '17.0.0',
    '16.0.6',
  ] as const,
  aliases: [] as const,
}

export type OpenmpllvmorgPackage = typeof openmpllvmorgPackage
