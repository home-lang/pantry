/**
 * **polkit** - polkit (formerly PolicyKit) is a toolkit for defining and handling authorizations. It is used for allowing unprivileged processes to speak to privileged processes.
 *
 * @domain `freedesktop.org/polkit`
 * @programs `pkaction`, `pkcheck`, `pkexec`, `pkttyagent`
 * @version `121.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/polkit`
 * @dependencies `gnome.org/glib^2.78`, `duktape.org^2.7`, `gnome.org/gobject-introspection^1.72`, ... (+2 more)
 * @buildDependencies `mesonbuild.com`, `gnu.org/gettext`, `gnome.org/libxslt` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgpolkit
 * console.log(pkg.name)        // "polkit"
 * console.log(pkg.description) // "polkit (formerly PolicyKit) is a toolkit for de..."
 * console.log(pkg.programs)    // ["pkaction", "pkcheck", ...]
 * console.log(pkg.versions[0]) // "121.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/polkit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgpolkitPackage = {
  /**
   * The display name of this package.
   */
  name: 'polkit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/polkit' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'polkit (formerly PolicyKit) is a toolkit for defining and handling authorizations. It is used for allowing unprivileged processes to speak to privileged processes.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/polkit/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/polkit-org/polkit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/polkit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/polkit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/polkit' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pkaction',
    'pkcheck',
    'pkexec',
    'pkttyagent',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib^2.78',
    'duktape.org^2.7',
    'gnome.org/gobject-introspection^1.72',
    'freedesktop.org/dbus^1.12',
    'linux-pam.org^1.4',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
    'gnu.org/gettext',
    'gnome.org/libxslt',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '121.0.0',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgpolkitPackage = typeof freedesktoporgpolkitPackage
