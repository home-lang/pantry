/**
 * **chrome-for-testing** - Versioned Chrome for server browser automation
 *
 * @domain `google.com/chrome`
 * @programs `google-chrome-stable`
 * @version `155.0.8059.84` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install google.com/chrome`
 * @homepage https://developer.chrome.com/docs/chromedriver/downloads
 * @dependencies `gnome.org/glib^2`, `mozilla.org/nspr^4`, `mozilla.org/nss^3`, ... (+20 more)
 * @buildDependencies `info-zip.org/unzip` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.googlecomchrome
 * console.log(pkg.name)        // "chrome-for-testing"
 * console.log(pkg.description) // "Versioned Chrome for server browser automation"
 * console.log(pkg.programs)    // ["google-chrome-stable"]
 * console.log(pkg.versions[0]) // "155.0.8059.84" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/google-com/chrome.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const googlecomchromePackage = {
  /**
  * The display name of this package.
  */
  name: 'chrome-for-testing' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'google.com/chrome' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Versioned Chrome for server browser automation' as const,
  homepageUrl: 'https://developer.chrome.com/docs/chromedriver/downloads' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install google.com/chrome' as const,
  pantryInstallCommand: 'pantry install google.com/chrome' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'google-chrome-stable',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/glib^2',
    'mozilla.org/nspr^4',
    'mozilla.org/nss^3',
    'gnome.org/atk^2',
    'freedesktop.org/at-spi2-atk^2',
    'freedesktop.org/at-spi2-core/libatspi~2.38',
    'freedesktop.org/dbus^1',
    'openprinting.github.io/cups^2',
    'libexpat.github.io^2',
    'x.org/xcb^1',
    'xkbcommon.org^1',
    'alsa-project.org/alsa-lib^1',
    'mesa3d.org^26',
    'dri.freedesktop.org^2',
    'x.org/x11^1',
    'x.org/exts^1',
    'cairographics.org^1',
    'gnome.org/pango^1',
    'systemd.io/libudev^262',
    'x.org/xcomposite^0',
    'x.org/xdamage^1',
    'x.org/xfixes^6',
    'x.org/xrandr^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'info-zip.org/unzip',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '155.0.8059.84',
  ] as const,
  aliases: [] as const,
}

export type GooglecomchromePackage = typeof googlecomchromePackage
