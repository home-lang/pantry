/**
 * **rsvg-convert** - Read-only mirror of https://gitlab.gnome.org/GNOME/librsvg
 *
 * @domain `gnome.org/librsvg`
 * @programs `rsvg-convert`
 * @version `2.61.4` (40 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/librsvg`
 * @homepage https://wiki.gnome.org/Projects/LibRsvg
 * @dependencies `cairographics.org^1.18`, `gnome.org/pango@1`, `gnome.org/gdk-pixbuf@2`, ... (+2 more)
 * @buildDependencies `python.org@>=3<3.12`, `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorglibrsvg
 * console.log(pkg.name)        // "rsvg-convert"
 * console.log(pkg.description) // "Read-only mirror of https://gitlab.gnome.org/GN..."
 * console.log(pkg.programs)    // ["rsvg-convert"]
 * console.log(pkg.versions[0]) // "2.61.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/librsvg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorglibrsvgPackage = {
  /**
  * The display name of this package.
  */
  name: 'rsvg-convert' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/librsvg' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Read-only mirror of https://gitlab.gnome.org/GNOME/librsvg' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/librsvg/package.yml' as const,
  homepageUrl: 'https://wiki.gnome.org/Projects/LibRsvg' as const,
  githubUrl: 'https://github.com/GNOME/librsvg' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/librsvg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/librsvg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/librsvg' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rsvg-convert',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'cairographics.org^1.18',
    'gnome.org/pango@1',
    'gnome.org/gdk-pixbuf@2',
    'gnome.org/glib@2',
    'gnu.org/gettext^0.21',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@>=3<3.12',
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.61.4',
    '2.61.3',
    '2.61.2',
    '2.61.1',
    '2.61.0',
    '2.60.2',
    '2.60.1',
    '2.60.0',
    '2.59.2',
    '2.59.1',
    '2.59.0',
    '2.58.5',
    '2.58.4',
    '2.58.3',
    '2.58.2',
    '2.58.1',
    '2.58.0',
    '2.57.91',
    '2.57.90',
    '2.57.4',
    '2.57.3',
    '2.57.2',
    '2.57.1',
    '2.57.0',
    '2.56.93',
    '2.56.92',
    '2.56.5',
    '2.56.4',
    '2.56.3',
    '2.56.2',
    '2.56.1',
    '2.55.3',
    '2.55.1',
    '2.54.7',
    '2.54.6',
    '2.52.12',
    '2.52.11',
    '2.52.10',
    '2.50.9',
    '2.50.8',
  ] as const,
  aliases: [] as const,
}

export type GnomeorglibrsvgPackage = typeof gnomeorglibrsvgPackage
