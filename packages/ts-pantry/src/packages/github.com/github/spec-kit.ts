/**
 * **spec-kit** - pkgx package
 *
 * @domain `github.com/github/spec-kit`
 * @version `0.1.7` (67 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/github/spec-kit`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.13` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgithubspeckit
 * console.log(pkg.name)        // "spec-kit"
 * console.log(pkg.versions[0]) // "0.1.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/github/spec-kit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const speckitPackage = {
  /**
  * The display name of this package.
  */
  name: 'spec-kit' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/github/spec-kit' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/github/spec-kit/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/github/spec-kit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/github/spec-kit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/github/spec-kit' as const,
  programs: [] as const,
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
  */
  buildDependencies: [
    'python.org@~3.13',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.7',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.0.102',
    '0.0.101',
    '0.0.100',
    '0.0.99',
    '0.0.98',
    '0.0.97',
    '0.0.96',
    '0.0.95',
    '0.0.94',
    '0.0.93',
    '0.0.92',
    '0.0.91',
    '0.0.90',
    '0.0.89',
    '0.0.88',
    '0.0.87',
    '0.0.86',
    '0.0.85',
    '0.0.84',
    '0.0.83',
    '0.0.82',
    '0.0.81',
    '0.0.80',
    '0.0.79',
    '0.0.78',
    '0.0.76',
    '0.0.75',
    '0.0.74',
    '0.0.73',
    '0.0.72',
    '0.0.71',
    '0.0.70',
    '0.0.69',
    '0.0.68',
    '0.0.66',
    '0.0.65',
    '0.0.64',
    '0.0.63',
    '0.0.62',
    '0.0.61',
    '0.0.60',
    '0.0.58',
    '0.0.57',
    '0.0.56',
    '0.0.55',
    '0.0.53',
    '0.0.52',
    '0.0.51',
    '0.0.50',
    '0.0.49',
    '0.0.48',
    '0.0.47',
    '0.0.46',
    '0.0.45',
    '0.0.44',
    '0.0.43',
    '0.0.42',
    '0.0.41',
    '0.0.40',
    '0.0.39',
    '0.0.38',
    '0.0.37',
  ] as const,
  aliases: [] as const,
}

export type SpeckitPackage = typeof speckitPackage
