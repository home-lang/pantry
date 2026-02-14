/**
 * **gtk-mac-integration-gtk3** - pkgx package
 *
 * @domain `gnome.org/gtk-mac-integration-gtk3`
 * @version `3.0.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/gtk-mac-integration-gtk3`
 * @dependencies `gnu.org/gettext`, `gtk.org/gtk3`
 * @buildDependencies `freedesktop.org/intltool`, `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorggtkmacintegrationgtk3
 * console.log(pkg.name)        // "gtk-mac-integration-gtk3"
 * console.log(pkg.versions[0]) // "3.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/gtk-mac-integration-gtk3.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorggtkmacintegrationgtk3Package = {
  /**
  * The display name of this package.
  */
  name: 'gtk-mac-integration-gtk3' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/gtk-mac-integration-gtk3' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/gtk-mac-integration-gtk3/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/gtk-mac-integration-gtk3' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/gtk-mac-integration-gtk3 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/gtk-mac-integration-gtk3' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/gettext',
    'gtk.org/gtk3',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'freedesktop.org/intltool',
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.0.2',
    '3.0.1',
  ] as const,
  aliases: [] as const,
}

export type Gnomeorggtkmacintegrationgtk3Package = typeof gnomeorggtkmacintegrationgtk3Package
