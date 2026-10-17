/**
 * **libatspi** - AT-SPI accessibility client library
 *
 * @domain `freedesktop.org/at-spi2-core/libatspi`
 * @version `2.38.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install freedesktop.org/at-spi2-core/libatspi`
 * @homepage https://gitlab.gnome.org/GNOME/at-spi2-core
 * @dependencies `gnome.org/glib^2`, `freedesktop.org/dbus^1`
 * @buildDependencies `mesonbuild.com`, `ninja-build.org`, `freedesktop.org/pkg-config^0.29`, ... (+4 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.freedesktoporgatspi2corelibatspi
 * console.log(pkg.name)        // "libatspi"
 * console.log(pkg.description) // "AT-SPI accessibility client library"
 * console.log(pkg.versions[0]) // "2.38.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/freedesktop-org/at-spi2-core/libatspi.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const freedesktoporgatspi2corelibatspiPackage = {
  /**
  * The display name of this package.
  */
  name: 'libatspi' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/at-spi2-core/libatspi' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'AT-SPI accessibility client library' as const,
  homepageUrl: 'https://gitlab.gnome.org/GNOME/at-spi2-core' as const,
  githubUrl: 'https://gitlab.gnome.org/GNOME/at-spi2-core' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install freedesktop.org/at-spi2-core/libatspi' as const,
  pantryInstallCommand: 'pantry install freedesktop.org/at-spi2-core/libatspi' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/glib^2',
    'freedesktop.org/dbus^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
    'ninja-build.org',
    'freedesktop.org/pkg-config^0.29',
    'python.org~3.12',
    'gnu.org/gettext',
    'gnu.org/coreutils',
    'bun.sh^1.3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.38.0',
  ] as const,
  aliases: [] as const,
}

export type Freedesktoporgatspi2corelibatspiPackage = typeof freedesktoporgatspi2corelibatspiPackage
