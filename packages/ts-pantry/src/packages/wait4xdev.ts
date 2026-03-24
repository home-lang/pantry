/**
 * **wait4x** - Wait4X allows you to wait for a port or a service to enter the requested state.
 *
 * @domain `wait4x.dev`
 * @programs `wait4x`
 * @version `3.6.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install wait4x.dev`
 * @homepage https://wait4x.dev
 * @buildDependencies `go.dev@~1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.wait4xdev
 * console.log(pkg.name)        // "wait4x"
 * console.log(pkg.description) // "Wait4X allows you to wait for a port or a servi..."
 * console.log(pkg.programs)    // ["wait4x"]
 * console.log(pkg.versions[0]) // "3.6.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/wait4x-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const wait4xdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'wait4x' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'wait4x.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Wait4X allows you to wait for a port or a service to enter the requested state.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wait4x.dev/package.yml' as const,
  homepageUrl: 'https://wait4x.dev' as const,
  githubUrl: 'https://github.com/atkrad/wait4x' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install wait4x.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wait4x.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install wait4x.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'wait4x',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.22',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.6.0',
    '3.5.1',
    '3.5.0',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.0',
    '2.14.3',
    '2.14.2',
    '2.14.1',
    '2.14.0',
    '2.13.0',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.0',
    '2.9.1',
    '2.9.0',
    '2.8.0',
    '2.7.0',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.0',
    '1.1.0',
    '1.0.0',
    '0.5.4',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.0',
    '0.3.0',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type Wait4xdevPackage = typeof wait4xdevPackage
