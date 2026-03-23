/**
 * **gqlgen** - go generate based graphql server library
 *
 * @domain `gqlgen.com`
 * @programs `gqlgen`
 * @version `0.17.88` (52 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gqlgen.com`
 * @homepage https://gqlgen.com
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.gqlgencom
 * console.log(pkg.name)        // "gqlgen"
 * console.log(pkg.description) // "go generate based graphql server library"
 * console.log(pkg.programs)    // ["gqlgen"]
 * console.log(pkg.versions[0]) // "0.17.88" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/gqlgen-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install gqlgen.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gqlgen.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install gqlgen.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.17.88',
    '0.17.87',
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
  ] as const,
  aliases: [] as const,
}

export type GqlgencomPackage = typeof gqlgencomPackage
