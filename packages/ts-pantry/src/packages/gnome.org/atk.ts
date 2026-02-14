/**
 * **atk** - pkgx package
 *
 * @domain `gnome.org/atk`
 * @version `2.38.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/atk`
 * @dependencies `gnome.org/glib@2`
 * @buildDependencies `mesonbuild.com@^0.63`, `gnu.org/gettext@^0.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorgatk
 * console.log(pkg.name)        // "atk"
 * console.log(pkg.versions[0]) // "2.38.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/atk.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorgatkPackage = {
  /**
  * The display name of this package.
  */
  name: 'atk' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/atk' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/atk/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/GNOME/atk' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/atk' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/atk -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/atk' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/glib@2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com@^0.63',
    'gnu.org/gettext@^0.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.38.0',
  ] as const,
  aliases: [] as const,
}

export type GnomeorgatkPackage = typeof gnomeorgatkPackage
