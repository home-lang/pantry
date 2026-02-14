/**
 * **pango** - Framework for layout and rendering of i18n text
 *
 * @domain `gnome.org/pango`
 * @programs `pango-list`, `pango-segmentation`, `pango-view`
 * @version `1.57.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/pango`
 * @homepage https://www.gtk.org/docs/architecture/pango
 * @dependencies `cairographics.org^1.18`, `freetype.org@2`, `gnome.org/glib@2`, ... (+4 more)
 * @buildDependencies `mesonbuild.com`, `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorgpango
 * console.log(pkg.name)        // "pango"
 * console.log(pkg.description) // "Framework for layout and rendering of i18n text"
 * console.log(pkg.programs)    // ["pango-list", "pango-segmentation", ...]
 * console.log(pkg.versions[0]) // "1.57.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/pango.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorgpangoPackage = {
  /**
  * The display name of this package.
  */
  name: 'pango' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/pango' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Framework for layout and rendering of i18n text' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/pango/package.yml' as const,
  homepageUrl: 'https://www.gtk.org/docs/architecture/pango' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/pango' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/pango -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/pango' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pango-list',
    'pango-segmentation',
    'pango-view',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'cairographics.org^1.18',
    'freetype.org@2',
    'gnome.org/glib@2',
    'harfbuzz.org@8',
    'freedesktop.org/fontconfig@2',
    'sourceware.org/libffi@3',
    'gnu.org/fribidi@1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@>=3<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.57.0',
    '1.56.4',
    '1.56.3',
    '1.56.2',
    '1.56.1',
    '1.56.0',
    '1.55.5',
    '1.55.0',
    '1.54.0',
    '1.52.2',
    '1.52.1',
    '1.52.0',
    '1.51.2',
    '1.50.14',
    '1.50.9',
  ] as const,
  aliases: [] as const,
}

export type GnomeorgpangoPackage = typeof gnomeorgpangoPackage
