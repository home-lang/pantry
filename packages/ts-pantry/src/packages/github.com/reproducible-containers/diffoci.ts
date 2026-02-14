/**
 * **diffoci** - diff for Docker and OCI container images
 *
 * @domain `github.com/reproducible-containers/diffoci`
 * @programs `diffoci`
 * @version `0.1.8` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/reproducible-containers/diffoci`
 * @buildDependencies `go.dev@1.21.0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomreproduciblecontainersdiffoci
 * console.log(pkg.name)        // "diffoci"
 * console.log(pkg.description) // "diff for Docker and OCI container images"
 * console.log(pkg.programs)    // ["diffoci"]
 * console.log(pkg.versions[0]) // "0.1.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/reproducible-containers/diffoci.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const diffociPackage = {
  /**
  * The display name of this package.
  */
  name: 'diffoci' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/reproducible-containers/diffoci' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'diff for Docker and OCI container images' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/reproducible-containers/diffoci/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/reproducible-containers/diffoci' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/reproducible-containers/diffoci' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/reproducible-containers/diffoci -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/reproducible-containers/diffoci' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'diffoci',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@1.21.0',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.8',
    '0.1.7',
    '0.1.6',
    '0.1.5',
    '0.1.4',
  ] as const,
  aliases: [] as const,
}

export type DiffociPackage = typeof diffociPackage
