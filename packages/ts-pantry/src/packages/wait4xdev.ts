/**
 * **wait4x** - Wait4X allows you to wait for a port or a service to enter the requested state.
 *
 * @domain `wait4x.dev`
 * @programs `wait4x`
 * @version `3.6.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wait4x.dev`
 * @homepage https://wait4x.dev
 * @buildDependencies `go.dev@~1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wait4xdev
 * console.log(pkg.name)        // "wait4x"
 * console.log(pkg.description) // "Wait4X allows you to wait for a port or a servi..."
 * console.log(pkg.programs)    // ["wait4x"]
 * console.log(pkg.versions[0]) // "3.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wait4x-dev.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install wait4x.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wait4x.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wait4x.dev' as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
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
  ] as const,
  aliases: [] as const,
}

export type Wait4xdevPackage = typeof wait4xdevPackage
