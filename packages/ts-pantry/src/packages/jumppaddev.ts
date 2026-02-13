/**
 * **jumppad** - Modern cloud native development environments
 *
 * @domain `jumppad.dev`
 * @programs `jumppad`
 * @version `0.24.0` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jumppad.dev`
 * @homepage https://jumppad.dev
 * @buildDependencies `go.dev@=1.21.5`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jumppaddev
 * console.log(pkg.name)        // "jumppad"
 * console.log(pkg.description) // "Modern cloud native development environments"
 * console.log(pkg.programs)    // ["jumppad"]
 * console.log(pkg.versions[0]) // "0.24.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jumppad-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jumppaddevPackage = {
  /**
   * The display name of this package.
   */
  name: 'jumppad' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'jumppad.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Modern cloud native development environments' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jumppad.dev/package.yml' as const,
  homepageUrl: 'https://jumppad.dev' as const,
  githubUrl: 'https://github.com/jumppad-labs/jumppad' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jumppad.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jumppad.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jumppad.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jumppad',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@=1.21.5',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.24.0',
    '0.23.3',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.1',
    '0.20.0',
    '0.19.0',
    '0.18.1',
    '0.18.0',
    '0.17.1',
    '0.17.0',
    '0.16.1',
    '0.16.0',
    '0.15.0',
    '0.14.0',
    '0.13.3',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.1',
    '0.12.0',
    '0.11.2',
    '0.11.1',
    '0.11.0',
  ] as const,
  aliases: [] as const,
}

export type JumppaddevPackage = typeof jumppaddevPackage
