/**
 * **talosctl** - CLI for out-of-band management of Kubernetes nodes created by Talos
 *
 * @domain `talos.dev`
 * @programs `talosctl`
 * @version `1.12.2` (43 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install talos.dev`
 * @homepage https://www.talos.dev/
 * @buildDependencies `go.dev@^1.21`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.talosdev
 * console.log(pkg.name)        // "talosctl"
 * console.log(pkg.description) // "CLI for out-of-band management of Kubernetes no..."
 * console.log(pkg.programs)    // ["talosctl"]
 * console.log(pkg.versions[0]) // "1.12.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/talos-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const talosdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'talosctl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'talos.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI for out-of-band management of Kubernetes nodes created by Talos' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/talos.dev/package.yml' as const,
  homepageUrl: 'https://www.talos.dev/' as const,
  githubUrl: 'https://github.com/siderolabs/talos' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install talos.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +talos.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install talos.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'talosctl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@^1.21',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.6',
    '1.11.5',
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.9',
    '1.10.8',
    '1.10.7',
    '1.10.6',
    '1.10.5',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.6',
    '1.9.5',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.8',
    '1.6.7',
    '1.6.6',
  ] as const,
  aliases: [] as const,
}

export type TalosdevPackage = typeof talosdevPackage
