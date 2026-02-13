/**
 * **nghttp2** - nghttp2 - HTTP/2 C Library and tools
 *
 * @domain `nghttp2.org`
 * @version `1.68.0` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nghttp2.org`
 * @homepage https://nghttp2.org
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nghttp2org
 * console.log(pkg.name)        // "nghttp2"
 * console.log(pkg.description) // "nghttp2 - HTTP/2 C Library and tools"
 * console.log(pkg.versions[0]) // "1.68.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nghttp2-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nghttp2orgPackage = {
  /**
   * The display name of this package.
   */
  name: 'nghttp2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'nghttp2.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'nghttp2 - HTTP/2 C Library and tools' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nghttp2.org/package.yml' as const,
  homepageUrl: 'https://nghttp2.org' as const,
  githubUrl: 'https://github.com/nghttp2/nghttp2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install nghttp2.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nghttp2.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nghttp2.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.68.0',
    '1.67.1',
    '1.67.0',
    '1.66.0',
    '1.65.0',
    '1.64.0',
    '1.63.0',
    '1.62.1',
    '1.62.0',
    '1.61.0',
    '1.60.0',
    '1.59.0',
    '1.58.0',
    '1.57.0',
    '1.56.0',
    '1.55.1',
    '1.55.0',
    '1.54.0',
    '1.53.0',
    '1.52.0',
    '1.51.0',
  ] as const,
  aliases: [] as const,
}

export type Nghttp2orgPackage = typeof nghttp2orgPackage
