/**
 * **lima-vm** - Linux virtual machines, with a focus on running containers
 *
 * @domain `lima-vm.io`
 * @programs `apptainer.lima`, `docker.lima`, `kubectl.lima`, `lima`, `limactl`, ... (+2 more)
 * @version `2.0.3` (33 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lima-vm.io`
 * @homepage https://lima-vm.io/
 * @dependencies `qemu.org`
 * @buildDependencies `go.dev`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.limavmio
 * console.log(pkg.name)        // "lima-vm"
 * console.log(pkg.description) // "Linux virtual machines, with a focus on running..."
 * console.log(pkg.programs)    // ["apptainer.lima", "docker.lima", ...]
 * console.log(pkg.versions[0]) // "2.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lima-vm-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const limavmioPackage = {
  /**
   * The display name of this package.
   */
  name: 'lima-vm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lima-vm.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Linux virtual machines, with a focus on running containers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lima-vm.io/package.yml' as const,
  homepageUrl: 'https://lima-vm.io/' as const,
  githubUrl: 'https://github.com/lima-vm/lima' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lima-vm.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lima-vm.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lima-vm.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'apptainer.lima',
    'docker.lima',
    'kubectl.lima',
    'lima',
    'limactl',
    'nerdctl.lima',
    'podman.lima',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'qemu.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.1',
    '0.19.0',
    '0.18.0',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.0',
  ] as const,
  aliases: [] as const,
}

export type LimavmioPackage = typeof limavmioPackage
