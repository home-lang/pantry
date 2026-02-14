/**
 * **xslt** - Read-only mirror of https://gitlab.gnome.org/GNOME/libxslt
 *
 * @domain `gnome.org/libxslt`
 * @programs `xslt-config`, `xsltproc`
 * @version `1.1.45` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/libxslt`
 * @homepage http://xmlsoft.org/XSLT/
 * @dependencies `gnome.org/libxml2`
 * @buildDependencies `gnu.org/patch`, `gnome.org/libxml2@~2.15.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorglibxslt
 * console.log(pkg.name)        // "xslt"
 * console.log(pkg.description) // "Read-only mirror of https://gitlab.gnome.org/GN..."
 * console.log(pkg.programs)    // ["xslt-config", "xsltproc"]
 * console.log(pkg.versions[0]) // "1.1.45" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/libxslt.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorglibxsltPackage = {
  /**
  * The display name of this package.
  */
  name: 'xslt' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/libxslt' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Read-only mirror of https://gitlab.gnome.org/GNOME/libxslt' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libxslt/package.yml' as const,
  homepageUrl: 'http://xmlsoft.org/XSLT/' as const,
  githubUrl: 'https://github.com/GNOME/libxslt' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/libxslt' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/libxslt -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/libxslt' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xslt-config',
    'xsltproc',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/libxml2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/patch',
    'gnome.org/libxml2@~2.15.1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.45',
    '1.1.43',
    '1.1.42',
    '1.1.41',
    '1.1.40',
    '1.1.39',
    '1.1.38',
    '1.1.37',
  ] as const,
  aliases: [] as const,
}

export type GnomeorglibxsltPackage = typeof gnomeorglibxsltPackage
