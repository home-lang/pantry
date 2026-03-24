/**
 * **changie** - Automated changelog tool for preparing releases with lots of customization options
 *
 * @domain `changie.dev`
 * @programs `changie`
 * @version `1.24.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install changie.dev`
 * @homepage https://changie.dev/
 * @buildDependencies `go.dev@>=1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.changiedev
 * console.log(pkg.name)        // "changie"
 * console.log(pkg.description) // "Automated changelog tool for preparing releases..."
 * console.log(pkg.programs)    // ["changie"]
 * console.log(pkg.versions[0]) // "1.24.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/changie-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const changiedevPackage = {
  /**
  * The display name of this package.
  */
  name: 'changie' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'changie.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Automated changelog tool for preparing releases with lots of customization options' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/changie.dev/package.yml' as const,
  homepageUrl: 'https://changie.dev/' as const,
  githubUrl: 'https://github.com/miniscruff/changie' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install changie.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +changie.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install changie.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'changie',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@>=1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.24.0',
    '1.23.0',
    '1.22.1',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.1',
    '1.20.0',
    '1.19.1',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.1',
    '1.15.0',
    '1.14.0',
    '1.13.1',
    '1.13.0',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.1',
    '1.5.0',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.0',
    '0.7.0',
    '0.6.0',
    '0.5.0',
    '0.4.1',
    '0.4.0',
    '0.3.0',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type ChangiedevPackage = typeof changiedevPackage
