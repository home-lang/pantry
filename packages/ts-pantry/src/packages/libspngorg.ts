/**
 * **libspng** - Simple, modern libpng alternative
 *
 * @domain `libspng.org`
 * @version `0.5.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libspng.org`
 * @homepage https://libspng.org
 * @dependencies `darwin:zlib.net` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libspngorg
 * console.log(pkg.name)        // "libspng"
 * console.log(pkg.description) // "Simple, modern libpng alternative"
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libspng-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libspngorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libspng' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libspng.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Simple, modern libpng alternative' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libspng.org/package.yml' as const,
  homepageUrl: 'https://libspng.org' as const,
  githubUrl: 'https://github.com/randy408/libspng' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libspng.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libspng.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libspng.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'darwin:zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type LibspngorgPackage = typeof libspngorgPackage
