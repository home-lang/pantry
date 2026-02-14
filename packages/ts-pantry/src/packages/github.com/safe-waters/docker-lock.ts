/**
 * **docker-lock** - pkgx package
 *
 * @domain `github.com/safe-waters/docker-lock`
 * @programs `docker-lock`
 * @version `0.8.10` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/safe-waters/docker-lock`
 * @dependencies `docker.com/cli`, `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsafewatersdockerlock
 * console.log(pkg.name)        // "docker-lock"
 * console.log(pkg.programs)    // ["docker-lock"]
 * console.log(pkg.versions[0]) // "0.8.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/safe-waters/docker-lock.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dockerlockPackage = {
  /**
  * The display name of this package.
  */
  name: 'docker-lock' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/safe-waters/docker-lock' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/safe-waters/docker-lock/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/safe-waters/docker-lock' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/safe-waters/docker-lock' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/safe-waters/docker-lock -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/safe-waters/docker-lock' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'docker-lock',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'docker.com/cli',
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.8.10',
  ] as const,
  aliases: [] as const,
}

export type DockerlockPackage = typeof dockerlockPackage
