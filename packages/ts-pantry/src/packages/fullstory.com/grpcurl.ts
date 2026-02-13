/**
 * **grpcurl** - Like cURL, but for gRPC: Command-line tool for interacting with gRPC servers
 *
 * @domain `fullstory.com/grpcurl`
 * @programs `grpcurl`
 * @version `1.9.3` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fullstory.com/grpcurl`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fullstorycomgrpcurl
 * console.log(pkg.name)        // "grpcurl"
 * console.log(pkg.description) // "Like cURL, but for gRPC: Command-line tool for ..."
 * console.log(pkg.programs)    // ["grpcurl"]
 * console.log(pkg.versions[0]) // "1.9.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fullstory-com/grpcurl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fullstorycomgrpcurlPackage = {
  /**
   * The display name of this package.
   */
  name: 'grpcurl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fullstory.com/grpcurl' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Like cURL, but for gRPC: Command-line tool for interacting with gRPC servers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fullstory.com/grpcurl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fullstorydev/grpcurl' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fullstory.com/grpcurl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fullstory.com/grpcurl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fullstory.com/grpcurl' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'grpcurl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
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
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.9',
  ] as const,
  aliases: [] as const,
}

export type FullstorycomgrpcurlPackage = typeof fullstorycomgrpcurlPackage
