/**
 * **casdoor** - pkgx package
 *
 * @domain `casdoor.org`
 * @programs `casdoor`
 * @version `2.366.0` (234 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install casdoor.org`
 * @buildDependencies `go.dev@^1.21`, `nodejs.org@18.19.0`, `classic.yarnpkg.com@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.casdoororg
 * console.log(pkg.name)        // "casdoor"
 * console.log(pkg.programs)    // ["casdoor"]
 * console.log(pkg.versions[0]) // "2.366.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/casdoor-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const casdoororgPackage = {
  /**
  * The display name of this package.
  */
  name: 'casdoor' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'casdoor.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/casdoor.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install casdoor.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +casdoor.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install casdoor.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'casdoor',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
    'nodejs.org@18.19.0',
    'classic.yarnpkg.com@^1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.382.1',
    '2.382.0',
    '2.381.3',
    '2.381.2',
    '2.381.1',
    '2.381.0',
    '2.380.0',
    '2.379.0',
    '2.378.1',
    '2.378.0',
    '2.377.0',
    '2.376.0',
    '2.375.0',
    '2.374.1',
    '2.374.0',
    '2.373.0',
    '2.372.0',
    '2.371.0',
    '2.370.0',
    '2.369.0',
    '2.368.1',
    '2.368.0',
    '2.367.0',
    '2.366.0',
    '2.365.0',
    '2.364.3',
    '2.364.2',
    '2.364.1',
    '2.364.0',
    '2.363.0',
    '2.362.0',
    '2.361.0',
    '2.360.0',
    '2.359.0',
    '2.358.0',
    '2.357.0',
    '2.356.0',
    '2.355.0',
    '2.354.0',
    '2.353.1',
    '2.353.0',
    '2.352.0',
    '2.351.0',
    '2.350.0',
    '2.349.0',
    '2.348.0',
    '2.347.0',
    '2.346.0',
    '2.345.0',
    '2.344.0',
    '2.343.1',
    '2.343.0',
    '2.342.0',
    '2.341.2',
    '2.341.1',
    '2.341.0',
    '2.340.0',
    '2.339.1',
    '2.339.0',
    '2.338.0',
    '2.337.0',
    '2.336.0',
    '2.335.1',
    '2.335.0',
    '2.334.0',
    '2.333.0',
    '2.332.0',
    '2.331.0',
    '2.330.0',
    '2.329.2',
    '2.329.1',
    '2.329.0',
    '2.328.0',
  ] as const,
  aliases: [] as const,
}

export type CasdoororgPackage = typeof casdoororgPackage
