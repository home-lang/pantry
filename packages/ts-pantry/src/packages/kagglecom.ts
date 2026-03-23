/**
 * **kaggle** - Official Kaggle API
 *
 * @domain `kaggle.com`
 * @programs `kaggle`
 * @version `1.7.4.5` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install kaggle.com`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@^3.12`, `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.kagglecom
 * console.log(pkg.name)        // "kaggle"
 * console.log(pkg.description) // "Official Kaggle API"
 * console.log(pkg.programs)    // ["kaggle"]
 * console.log(pkg.versions[0]) // "1.7.4.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/kaggle-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const kagglecomPackage = {
  /**
  * The display name of this package.
  */
  name: 'kaggle' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kaggle.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Official Kaggle API' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kaggle.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Kaggle/kaggle-api' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install kaggle.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kaggle.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install kaggle.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kaggle',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'python.org@^3.12',
    'linux:llvm.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.4.5',
    '1.7.4.2',
    '1.6.3',
    '1.6.1',
    '1.6.0a3',
    '1.5.16',
    '1.5.15',
    '1.5.14',
  ] as const,
  aliases: [] as const,
}

export type KagglecomPackage = typeof kagglecomPackage
