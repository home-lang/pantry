/**
 * **gdk-pixbuf** - Toolkit for image loading and pixel buffer manipulation
 *
 * @domain `gnome.org/gdk-pixbuf`
 * @programs `gdk-pixbuf-csource`, `gdk-pixbuf-pixdata`, `gdk-pixbuf-query-loaders`, `gdk-pixbuf-thumbnailer`
 * @version `2.44.5` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/gdk-pixbuf`
 * @homepage https://gtk.org
 * @dependencies `ijg.org^9.6 # needs fixed major; sadly this includes the character > v9f`, `gnome.org/glib@2`, `libpng.org@1`, ... (+1 more)
 * @buildDependencies `mesonbuild.com@1`, `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorggdkpixbuf
 * console.log(pkg.name)        // "gdk-pixbuf"
 * console.log(pkg.description) // "Toolkit for image loading and pixel buffer mani..."
 * console.log(pkg.programs)    // ["gdk-pixbuf-csource", "gdk-pixbuf-pixdata", ...]
 * console.log(pkg.versions[0]) // "2.44.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/gdk-pixbuf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorggdkpixbufPackage = {
  /**
  * The display name of this package.
  */
  name: 'gdk-pixbuf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/gdk-pixbuf' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Toolkit for image loading and pixel buffer manipulation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/gdk-pixbuf/package.yml' as const,
  homepageUrl: 'https://gtk.org' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/gdk-pixbuf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/gdk-pixbuf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/gdk-pixbuf' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gdk-pixbuf-csource',
    'gdk-pixbuf-pixdata',
    'gdk-pixbuf-query-loaders',
    'gdk-pixbuf-thumbnailer',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'ijg.org^9.6 # needs fixed major; sadly this includes the character > v9f',
    'gnome.org/glib@2',
    'libpng.org@1',
    'freedesktop.org/shared-mime-info^2 #FIXME only on Linux',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com@1',
    'python.org@>=3<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.44.5',
    '2.44.4',
    '2.44.3',
    '2.44.2',
    '2.44.1',
    '2.44.0',
    '2.43.5',
    '2.43.3',
    '2.43.2',
    '2.42.9',
    '2.42.8',
  ] as const,
  aliases: [] as const,
}

export type GnomeorggdkpixbufPackage = typeof gnomeorggdkpixbufPackage
