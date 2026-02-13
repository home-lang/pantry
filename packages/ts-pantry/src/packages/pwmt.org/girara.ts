/**
 * **girara** - User interface library
 *
 * @domain `pwmt.org/girara`
 * @version `0.4.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pwmt.org/girara`
 * @homepage https://pwmt.org/projects/girara
 * @dependencies `gtk.org/gtk3@3`, `gnome.org/glib^2.72`, `gnome.org/json-glib^1`
 * @buildDependencies `mesonbuild.com@>=0.61`, `gnu.org/gettext` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pwmtorggirara
 * console.log(pkg.name)        // "girara"
 * console.log(pkg.description) // "User interface library"
 * console.log(pkg.versions[0]) // "0.4.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pwmt-org/girara.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pwmtorggiraraPackage = {
  /**
   * The display name of this package.
   */
  name: 'girara' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pwmt.org/girara' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'User interface library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pwmt.org/girara/package.yml' as const,
  homepageUrl: 'https://pwmt.org/projects/girara' as const,
  githubUrl: 'https://github.com/pwmt/girara' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pwmt.org/girara' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pwmt.org/girara -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pwmt.org/girara' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gtk.org/gtk3@3',
    'gnome.org/glib^2.72',
    'gnome.org/json-glib^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@>=0.61',
    'gnu.org/gettext',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.5',
    '0.4.4',
  ] as const,
  aliases: [] as const,
}

export type PwmtorggiraraPackage = typeof pwmtorggiraraPackage
