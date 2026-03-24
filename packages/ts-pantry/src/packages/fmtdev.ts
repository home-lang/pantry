/**
 * **fmt** - A modern formatting library
 *
 * @domain `fmt.dev`
 * @version `12.1.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install fmt.dev`
 * @homepage https://fmt.dev
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.fmtdev
 * console.log(pkg.name)        // "fmt"
 * console.log(pkg.description) // "A modern formatting library"
 * console.log(pkg.versions[0]) // "12.1.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/fmt-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const fmtdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'fmt' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'fmt.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A modern formatting library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fmt.dev/package.yml' as const,
  homepageUrl: 'https://fmt.dev' as const,
  githubUrl: 'https://github.com/fmtlib/fmt' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install fmt.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fmt.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install fmt.dev' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '12.1.0',
    '12.0.0',
    '11.2.0',
    '11.1.4',
    '11.1.3',
    '11.1.2',
    '11.1.1',
    '11.1.0',
    '11.0.2',
    '11.0.1',
    '11.0.0',
    '10.2.1',
    '10.2.0',
    '10.1.1',
    '10.1.0',
    '10.0.0',
    '9.1.0',
    '9.0.0',
    '8.1.1',
    '8.1.0',
    '8.0.1',
    '8.0.0',
    '7.1.3',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.3',
    '7.0.2',
    '7.0.1',
    '7.0.0',
    '6.2.1',
    '6.2.0',
    '6.1.2',
    '6.1.1',
    '6.1.0',
    '6.0.0',
    '5.3.0',
    '5.2.1',
    '5.2.0',
    '5.1.0',
    '5.0.0',
    '4.1.0',
    '4.0.0',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.1.1',
    '2.1.0',
    '2.0.1',
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type FmtdevPackage = typeof fmtdevPackage
