/**
 * **woff2** - Utilities to create and convert Web Open Font File (WOFF) files
 *
 * @domain `google.com/woff2`
 * @programs `woff2_info`, `woff2_decompress`, `woff2_compress`
 * @version `1.0.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/woff2`
 * @dependencies `github.com/google/brotli`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomwoff2
 * console.log(pkg.name)        // "woff2"
 * console.log(pkg.description) // "Utilities to create and convert Web Open Font F..."
 * console.log(pkg.programs)    // ["woff2_info", "woff2_decompress", ...]
 * console.log(pkg.versions[0]) // "1.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/woff2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomwoff2Package = {
  /**
   * The display name of this package.
   */
  name: 'woff2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'google.com/woff2' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Utilities to create and convert Web Open Font File (WOFF) files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/woff2/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/woff2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install google.com/woff2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/woff2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/woff2' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'woff2_info',
    'woff2_decompress',
    'woff2_compress',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'github.com/google/brotli',
    'linux:gnu.org/gcc',
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
    '1.0.2',
  ] as const,
  aliases: [] as const,
}

export type Googlecomwoff2Package = typeof googlecomwoff2Package
