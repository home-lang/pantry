/**
 * **tbb** - oneAPI Threading Building Blocks (oneTBB)
 *
 * @domain `github.com/oneapi-src/oneTBB`
 * @version `2022.3.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/oneapi-src/oneTBB`
 * @homepage https://uxlfoundation.github.io/oneTBB/
 * @dependencies `python.org~3.11`
 * @buildDependencies `cmake.org`, `swig.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomoneapisrconetbb
 * console.log(pkg.name)        // "tbb"
 * console.log(pkg.description) // "oneAPI Threading Building Blocks (oneTBB)"
 * console.log(pkg.versions[0]) // "2022.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/oneapi-src/oneTBB.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const onetbbPackage = {
  /**
  * The display name of this package.
  */
  name: 'tbb' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/oneapi-src/oneTBB' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'oneAPI Threading Building Blocks (oneTBB)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/oneapi-src/oneTBB/package.yml' as const,
  homepageUrl: 'https://uxlfoundation.github.io/oneTBB/' as const,
  githubUrl: 'https://github.com/oneapi-src/oneTBB' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/oneapi-src/oneTBB' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/oneapi-src/oneTBB -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/oneapi-src/oneTBB' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'swig.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2022.3.0',
    '2022.2.0',
    '2022.1.0',
    '2022.0.0',
    '2021.13.0',
    '2021.12.0',
    '2021.11.0',
    '2021.10.0',
  ] as const,
  aliases: [] as const,
}

export type OnetbbPackage = typeof onetbbPackage
