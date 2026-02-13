/**
 * **fastfetch** - A maintained, feature-rich and performance oriented, neofetch like system information tool.
 *
 * @domain `github.com/fastfetch-cli/fastfetch`
 * @programs `fastfetch`, `flashfetch`
 * @version `2.58.0` (40 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/fastfetch-cli/fastfetch`
 * @buildDependencies `cmake.org@^3`, `gnome.org/glib@^2`, `imagemagick.org@^7`, ... (+10 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomfastfetchclifastfetch
 * console.log(pkg.name)        // "fastfetch"
 * console.log(pkg.description) // "A maintained, feature-rich and performance orie..."
 * console.log(pkg.programs)    // ["fastfetch", "flashfetch"]
 * console.log(pkg.versions[0]) // "2.58.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/fastfetch-cli/fastfetch.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fastfetchPackage = {
  /**
   * The display name of this package.
   */
  name: 'fastfetch' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/fastfetch-cli/fastfetch' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A maintained, feature-rich and performance oriented, neofetch like system information tool.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/fastfetch-cli/fastfetch/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fastfetch-cli/fastfetch' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/fastfetch-cli/fastfetch' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/fastfetch-cli/fastfetch -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/fastfetch-cli/fastfetch' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fastfetch',
    'flashfetch',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
    'gnome.org/glib@^2',
    'imagemagick.org@^7',
    'python.org@~3.12',
    'sqlite.org@^3',
    'zlib.net@^1',
    'linux:freedesktop.org/dbus@^1',
    'linux:elfutils.org@^0',
    'linux:x.org/x11@^1',
    'linux:x.org/xcb@^1',
    'linux:x.org/xrandr@^1',
    'linux:mesa3d.org@^24',
    'linux:wayland.freedesktop.org@^1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.58.0',
    '2.57.1',
    '2.57.0',
    '2.56.1',
    '2.56.0',
    '2.55.1',
    '2.55.0',
    '2.54.0',
    '2.53.0',
    '2.52.0',
    '2.51.1',
    '2.51.0',
    '2.50.2',
    '2.50.1',
    '2.50.0',
    '2.49.0',
    '2.48.1',
    '2.48.0',
    '2.47.0',
    '2.46.0',
    '2.45.0',
    '2.44.0',
    '2.43.0',
    '2.42.0',
    '2.41.0',
    '2.40.4',
    '2.40.3',
    '2.40.2',
    '2.40.1',
    '2.40.0',
    '2.39.1',
    '2.39.0',
    '2.38.0',
    '2.37.0',
    '2.36.1',
    '2.36.0',
    '2.35.0',
    '2.34.1',
    '2.34.0',
    '2.33.0',
  ] as const,
  aliases: [] as const,
}

export type FastfetchPackage = typeof fastfetchPackage
