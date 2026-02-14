/**
 * **xb-tool** - A library to help create and query binary XML blobs
 *
 * @domain `github.com/hughsie/libxmlb`
 * @programs `xb-tool`
 * @version `0.3.25` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/hughsie/libxmlb`
 * @dependencies `gnome.org/glib@2`, `tukaani.org/xz@5`, `facebook.com/zstd@1`
 * @buildDependencies `mesonbuild.com@>=0.61`, `python.org@3`, `gnome.org/vala` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomhughsielibxmlb
 * console.log(pkg.name)        // "xb-tool"
 * console.log(pkg.description) // "A library to help create and query binary XML b..."
 * console.log(pkg.programs)    // ["xb-tool"]
 * console.log(pkg.versions[0]) // "0.3.25" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/hughsie/libxmlb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libxmlbPackage = {
  /**
  * The display name of this package.
  */
  name: 'xb-tool' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/hughsie/libxmlb' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A library to help create and query binary XML blobs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/hughsie/libxmlb/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/hughsie/libxmlb' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/hughsie/libxmlb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/hughsie/libxmlb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/hughsie/libxmlb' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xb-tool',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/glib@2',
    'tukaani.org/xz@5',
    'facebook.com/zstd@1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com@>=0.61',
    'python.org@3',
    'gnome.org/vala',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.25',
    '0.3.24',
    '0.3.23',
    '0.3.22',
    '0.3.21',
    '0.3.20',
    '0.3.19',
  ] as const,
  aliases: [] as const,
}

export type LibxmlbPackage = typeof libxmlbPackage
