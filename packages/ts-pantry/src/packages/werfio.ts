/**
 * **werf** - A solution for implementing efficient and consistent software delivery to Kubernetes facilitating best practices.
 *
 * @domain `werf.io`
 * @programs `werf`
 * @version `2.63.1` (219 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install werf.io`
 * @homepage https://werf.io/
 * @buildDependencies `go.dev@^1.23`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.werfio
 * console.log(pkg.name)        // "werf"
 * console.log(pkg.description) // "A solution for implementing efficient and consi..."
 * console.log(pkg.programs)    // ["werf"]
 * console.log(pkg.versions[0]) // "2.63.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/werf-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const werfioPackage = {
  /**
  * The display name of this package.
  */
  name: 'werf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'werf.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A solution for implementing efficient and consistent software delivery to Kubernetes facilitating best practices.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/werf.io/package.yml' as const,
  homepageUrl: 'https://werf.io/' as const,
  githubUrl: 'https://github.com/werf/werf' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install werf.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +werf.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install werf.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'werf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'go.dev@^1.23',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.65.1',
    '2.65.0',
    '2.63.1',
    '2.63.0',
    '2.62.2',
    '2.62.1',
    '2.61.1',
    '2.61.0',
    '2.60.0',
    '2.59.0',
    '2.58.0',
    '2.57.2',
    '2.57.1',
    '2.57.0',
    '2.56.2',
    '2.56.1',
    '2.56.0',
    '2.55.6',
    '2.55.4',
    '2.55.3',
    '2.55.2',
    '2.55.1',
    '2.55.0',
    '2.54.1',
    '2.54.0',
    '2.53.5',
    '2.53.4',
    '2.53.3',
    '2.53.2',
    '2.53.1',
    '2.53.0',
    '2.52.0',
    '2.51.7',
    '2.51.6',
    '2.51.5',
    '2.51.4',
    '2.51.3',
    '2.51.2',
    '2.51.1',
    '2.51.0',
    '2.50.2',
    '2.50.1',
    '2.49.4',
    '2.49.1',
    '2.49.0',
    '2.48.3',
    '1.2.336',
    '1.2.335',
  ] as const,
  aliases: [] as const,
}

export type WerfioPackage = typeof werfioPackage
