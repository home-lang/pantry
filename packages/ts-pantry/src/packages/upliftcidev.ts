/**
 * **uplift** - Semantic versioning the easy way. Powered by Conventional Commits. Built for use with CI.
 *
 * @domain `upliftci.dev`
 * @programs `uplift`
 * @version `2.26.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install upliftci.dev`
 * @homepage https://upliftci.dev
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.upliftcidev
 * console.log(pkg.name)        // "uplift"
 * console.log(pkg.description) // "Semantic versioning the easy way. Powered by Co..."
 * console.log(pkg.programs)    // ["uplift"]
 * console.log(pkg.versions[0]) // "2.26.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/upliftci-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const upliftcidevPackage = {
  /**
  * The display name of this package.
  */
  name: 'uplift' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'upliftci.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Semantic versioning the easy way. Powered by Conventional Commits. Built for use with CI.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/upliftci.dev/package.yml' as const,
  homepageUrl: 'https://upliftci.dev' as const,
  githubUrl: 'https://github.com/gembaadvantage/uplift' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install upliftci.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +upliftci.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install upliftci.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'uplift',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.26.0',
    '2.25.0',
    '2.24.1',
    '2.24.0',
    '2.23.0',
    '2.22.0',
    '2.21.0',
    '2.20.0',
    '2.19.0',
    '2.18.1',
    '2.18.0',
    '2.17.0',
    '2.16.0',
    '2.15.0',
    '2.14.0',
    '2.13.0',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.0',
    '2.9.0',
    '2.8.0',
    '2.7.0',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.1',
    '1.12.0',
    '1.11.0',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
  ] as const,
  aliases: [] as const,
}

export type UpliftcidevPackage = typeof upliftcidevPackage
