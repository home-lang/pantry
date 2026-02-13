/**
 * **gsf** - I/O abstraction library for dealing with structured file formats
 *
 * @domain `gnome.org/libgsf`
 * @programs `gsf`, `gsf-office-thumbnailer`, `gsf-vba-dump`
 * @version `1.14.55` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/libgsf`
 * @homepage https://gitlab.gnome.org/GNOME/libgsf
 * @dependencies `gnome.org/glib`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorglibgsf
 * console.log(pkg.name)        // "gsf"
 * console.log(pkg.description) // "I/O abstraction library for dealing with struct..."
 * console.log(pkg.programs)    // ["gsf", "gsf-office-thumbnailer", ...]
 * console.log(pkg.versions[0]) // "1.14.55" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/libgsf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorglibgsfPackage = {
  /**
   * The display name of this package.
   */
  name: 'gsf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnome.org/libgsf' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'I/O abstraction library for dealing with structured file formats' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libgsf/package.yml' as const,
  homepageUrl: 'https://gitlab.gnome.org/GNOME/libgsf' as const,
  githubUrl: 'https://github.com/GNOME/libgsf' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnome.org/libgsf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/libgsf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/libgsf' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gsf',
    'gsf-office-thumbnailer',
    'gsf-vba-dump',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.14.55',
    '1.14.54',
    '1.14.53',
    '1.14.52',
    '1.14.51',
    '1.14.50',
  ] as const,
  aliases: [] as const,
}

export type GnomeorglibgsfPackage = typeof gnomeorglibgsfPackage
