/**
 * **chromedriver** - pkgx package
 *
 * @domain `chromedriver.chromium.org`
 * @programs `chromedriver`
 * @version `114.0.5735.90` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install chromedriver.chromium.org`
 * @dependencies `linux:gnome.org/glib^2`, `linux:mozilla.org/nss`, `linux:x.org/xcb` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.chromedriverchromiumorg
 * console.log(pkg.name)        // "chromedriver"
 * console.log(pkg.programs)    // ["chromedriver"]
 * console.log(pkg.versions[0]) // "114.0.5735.90" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/chromedriver-chromium-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const chromedriverchromiumorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'chromedriver' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'chromedriver.chromium.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/chromedriver.chromium.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install chromedriver.chromium.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +chromedriver.chromium.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install chromedriver.chromium.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'chromedriver',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:gnome.org/glib^2',
    'linux:mozilla.org/nss',
    'linux:x.org/xcb',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '114.0.5735.90',
  ] as const,
  aliases: [] as const,
}

export type ChromedriverchromiumorgPackage = typeof chromedriverchromiumorgPackage
