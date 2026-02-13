/**
 * **gqlgen** - go generate based graphql server library
 *
 * @domain `gqlgen.com`
 * @programs `gqlgen`
 * @version `0.17.86` (50 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gqlgen.com`
 * @homepage https://gqlgen.com
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gqlgencom
 * console.log(pkg.name)        // "gqlgen"
 * console.log(pkg.description) // "go generate based graphql server library"
 * console.log(pkg.programs)    // ["gqlgen"]
 * console.log(pkg.versions[0]) // "0.17.86" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gqlgen-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gqlgencomPackage = {
  /**
   * The display name of this package.
   */
  name: 'gqlgen' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gqlgen.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'go generate based graphql server library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gqlgen.com/package.yml' as const,
  homepageUrl: 'https://gqlgen.com' as const,
  githubUrl: 'https://github.com/99designs/gqlgen' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gqlgen.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gqlgen.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gqlgen.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gqlgen',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.17.86',
    '0.17.85',
    '0.17.84',
    '0.17.83',
    '0.17.82',
    '0.17.81',
    '0.17.80',
    '0.17.79',
    '0.17.78',
    '0.17.77',
    '0.17.76',
    '0.17.75',
    '0.17.74',
    '0.17.73',
    '0.17.72',
    '0.17.71',
    '0.17.70',
    '0.17.69',
    '0.17.68',
    '0.17.67',
    '0.17.66',
    '0.17.65',
    '0.17.64',
    '0.17.63',
    '0.17.62',
    '0.17.61',
    '0.17.60',
    '0.17.59',
    '0.17.58',
    '0.17.57',
    '0.17.56',
    '0.17.55',
    '0.17.54',
    '0.17.53',
    '0.17.52',
    '0.17.51',
    '0.17.50',
    '0.17.49',
    '0.17.48',
    '0.17.47',
    '0.17.46',
    '0.17.45',
    '0.17.44',
    '0.17.43',
    '0.17.42',
    '0.17.41',
    '0.17.40',
    '0.17.39',
    '0.17.38',
    '0.17.37',
  ] as const,
  aliases: [] as const,
}

export type GqlgencomPackage = typeof gqlgencomPackage
