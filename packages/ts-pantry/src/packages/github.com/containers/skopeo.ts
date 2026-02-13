/**
 * **skopeo** - Work with remote images registries - retrieving information, images, signing content
 *
 * @domain `github.com/containers/skopeo`
 * @programs `skopeo`
 * @version `1.21.0` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/containers/skopeo`
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.18`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcontainersskopeo
 * console.log(pkg.name)        // "skopeo"
 * console.log(pkg.description) // "Work with remote images registries - retrieving..."
 * console.log(pkg.programs)    // ["skopeo"]
 * console.log(pkg.versions[0]) // "1.21.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/containers/skopeo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const skopeoPackage = {
  /**
   * The display name of this package.
   */
  name: 'skopeo' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/containers/skopeo' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Work with remote images registries - retrieving information, images, signing content' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/containers/skopeo/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/containers/skopeo' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/containers/skopeo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/containers/skopeo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/containers/skopeo' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'skopeo',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.21.0',
    '1.20.0',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.2',
    '1.15.1',
    '1.15.0',
    '1.14.5',
    '1.14.4',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.3',
    '1.11.4',
    '1.11.3',
  ] as const,
  aliases: [] as const,
}

export type SkopeoPackage = typeof skopeoPackage
