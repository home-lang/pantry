/**
 * **libkml** - Reference implementation of OGC KML 2.2
 *
 * @domain `github.com/libkml/libkml`
 * @version `1.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/libkml/libkml`
 * @dependencies `zlib.net/minizip^1.3`, `uriparser.github.io^0.9`, `curl.se^8`, ... (+2 more)
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlibkmllibkml
 * console.log(pkg.name)        // "libkml"
 * console.log(pkg.description) // "Reference implementation of OGC KML 2.2"
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/libkml/libkml.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libkmlPackage = {
  /**
   * The display name of this package.
   */
  name: 'libkml' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/libkml/libkml' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Reference implementation of OGC KML 2.2' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libkml/libkml/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/libkml/libkml' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/libkml/libkml' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/libkml/libkml -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/libkml/libkml' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net/minizip^1.3',
    'uriparser.github.io^0.9',
    'curl.se^8',
    'libexpat.github.io^2.5',
    'boost.org>=1.81',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.0',
  ] as const,
  aliases: [] as const,
}

export type LibkmlPackage = typeof libkmlPackage
