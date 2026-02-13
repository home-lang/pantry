/**
 * **docker-machine** - Create Docker hosts locally and on cloud providers
 *
 * @domain `docker.com/machine`
 * @programs `docker-machine`
 * @version `0.16.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install docker.com/machine`
 * @homepage https://docs.gitlab.com/runner/executors/docker_machine.html
 * @buildDependencies `gnu.org/automake`, `go.dev`, `linux:curl.se` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dockercommachine
 * console.log(pkg.name)        // "docker-machine"
 * console.log(pkg.description) // "Create Docker hosts locally and on cloud providers"
 * console.log(pkg.programs)    // ["docker-machine"]
 * console.log(pkg.versions[0]) // "0.16.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/docker-com/machine.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dockercommachinePackage = {
  /**
   * The display name of this package.
   */
  name: 'docker-machine' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'docker.com/machine' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Create Docker hosts locally and on cloud providers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/machine/package.yml' as const,
  homepageUrl: 'https://docs.gitlab.com/runner/executors/docker_machine.html' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install docker.com/machine' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +docker.com/machine -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install docker.com/machine' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'docker-machine',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/automake',
    'go.dev',
    'linux:curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.16.2',
  ] as const,
  aliases: [] as const,
}

export type DockercommachinePackage = typeof dockercommachinePackage
