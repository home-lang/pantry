/**
 * **freetype** - pkgx package
 *
 * @domain `freetype.org`
 * @version `2.14.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freetype.org`
 * @dependencies `libpng.org@1`, `zlib.net@1`, `sourceware.org/bzip2@1`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freetypeorg
 * console.log(pkg.name)        // "freetype"
 * console.log(pkg.versions[0]) // "2.14.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freetype-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freetypeorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'freetype' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freetype.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freetype.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freetype.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freetype.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freetype.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libpng.org@1',
    'zlib.net@1',
    'sourceware.org/bzip2@1',
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
    '2.14.1',
    '2.14.0',
    '2.13.3',
    '2.13.2',
    '2.13.1',
    '2.12.1',
  ] as const,
  aliases: [] as const,
}

export type FreetypeorgPackage = typeof freetypeorgPackage
