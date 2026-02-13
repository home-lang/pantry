/**
 * **docker-clean** - A script that cleans docker containers, images, volumes, and networks.
 *
 * @domain `github.com/ZZROTDesign/docker-clean`
 * @programs `docker-clean`
 * @version `2.0.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ZZROTDesign/docker-clean`
 * @dependencies `gnu.org/bash`, `docker.com/cli`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomzzrotdesigndockerclean
 * console.log(pkg.name)        // "docker-clean"
 * console.log(pkg.description) // "A script that cleans docker containers, images,..."
 * console.log(pkg.programs)    // ["docker-clean"]
 * console.log(pkg.versions[0]) // "2.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ZZROTDesign/docker-clean.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dockercleanPackage = {
  /**
   * The display name of this package.
   */
  name: 'docker-clean' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/ZZROTDesign/docker-clean' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A script that cleans docker containers, images, volumes, and networks. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ZZROTDesign/docker-clean/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ZZROTDesign/docker-clean' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/ZZROTDesign/docker-clean' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ZZROTDesign/docker-clean -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ZZROTDesign/docker-clean' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'docker-clean',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/bash',
    'docker.com/cli',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.4',
  ] as const,
  aliases: [] as const,
}

export type DockercleanPackage = typeof dockercleanPackage
