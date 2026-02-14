/**
 * **container-structure-test** - validate the structure of your container images
 *
 * @domain `github.com/GoogleContainerTools/container-structure-test`
 * @programs `container-structure-test`
 * @version `1.22.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/GoogleContainerTools/container-structure-test`
 * @buildDependencies `go.dev@^1.22`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgooglecontainertoolscontainerstructuretest
 * console.log(pkg.name)        // "container-structure-test"
 * console.log(pkg.description) // "validate the structure of your container images"
 * console.log(pkg.programs)    // ["container-structure-test"]
 * console.log(pkg.versions[0]) // "1.22.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/GoogleContainerTools/container-structure-test.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const containerstructuretestPackage = {
  /**
  * The display name of this package.
  */
  name: 'container-structure-test' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/GoogleContainerTools/container-structure-test' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'validate the structure of your container images' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/GoogleContainerTools/container-structure-test/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/GoogleContainerTools/container-structure-test' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/GoogleContainerTools/container-structure-test' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/GoogleContainerTools/container-structure-test -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/GoogleContainerTools/container-structure-test' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'container-structure-test',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.22',
    'goreleaser.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.22.1',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.0',
    '1.19.3',
    '1.19.2',
    '1.19.1',
  ] as const,
  aliases: [] as const,
}

export type ContainerstructuretestPackage = typeof containerstructuretestPackage
