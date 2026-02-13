/**
 * **mesa3d** - pkgx package
 *
 * @domain `mesa3d.org`
 * @version `25.3.3` (73 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mesa3d.org`
 * @dependencies `libexpat.github.io`, `x.org/x11`, `x.org/xcb`, ... (+21 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/bison`, `mesonbuild.com`, `pygments.org`, ... (+6 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mesa3dorg
 * console.log(pkg.name)        // "mesa3d"
 * console.log(pkg.versions[0]) // "25.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mesa3d-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mesa3dorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'mesa3d' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mesa3d.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mesa3d.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mesa3d.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mesa3d.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mesa3d.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'libexpat.github.io',
    'x.org/x11',
    'x.org/xcb',
    'x.org/xdamage',
    'x.org/exts',
    'invisible-island.net/ncurses',
    'zlib.net',
    'x.org/xrandr',
    'darwin:gnu.org/gettext',
    'linux:gnome.org/libxml2~2.13 # since 25.0.3, 2.14 changed the API version',
    'linux:elfutils.org',
    'linux:khronos.org/glslang',
    'linux:info-zip.org/zip',
    'linux:dri.freedesktop.org^2.4.110',
    'linux:intel.com/libva',
    'linux:freedesktop.org/vdpau',
    'linux:x.org/xfixes',
    'linux:x.org/xshmfence',
    'linux:x.org/xv',
    'linux:x.org/xxf86vm',
    'linux:llvm.org',
    'linux:github.com/lm-sensors/lm-sensors',
    'linux:wayland.freedesktop.org',
    'linux:wayland.freedesktop.org/protocols',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/bison',
    'mesonbuild.com',
    'pygments.org',
    'python.org@~3.11',
    'x.org/protocol',
    'github.com/westes/flex',
    'llvm.org',
    'linux:curl.se',
    'linux:cmake.org@3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '25.3.3',
    '25.3.2',
    '25.3.1',
    '25.3.0',
    '25.2.8',
    '25.2.7',
    '25.2.6',
    '25.2.5',
    '25.2.4',
    '25.2.3',
    '25.2.2',
    '25.2.1',
    '25.2.0',
    '25.1.9',
    '25.1.8',
    '25.1.7',
    '25.1.6',
    '25.1.5',
    '25.1.4',
    '25.1.3',
    '25.1.2',
    '25.1.1',
    '25.1.0',
    '25.0.7',
    '25.0.6',
    '25.0.5',
    '25.0.4',
    '25.0.3',
    '25.0.2',
    '25.0.1',
    '25.0.0',
    '24.3.4',
    '24.3.3',
    '24.3.2',
    '24.3.1',
    '24.3.0',
    '24.2.8',
    '24.2.7',
    '24.2.6',
    '24.2.5',
    '24.2.4',
    '24.2.3',
    '24.2.2',
    '24.2.1',
    '24.2.0',
    '24.1.7',
    '24.1.6',
    '24.1.5',
    '24.1.4',
    '24.1.3',
    '24.1.2',
    '24.1.1',
    '24.1.0',
    '24.0.9',
    '24.0.8',
    '24.0.7',
    '24.0.6',
    '24.0.5',
    '24.0.4',
    '24.0.3',
    '24.0.2',
    '24.0.1',
    '24.0.0',
    '23.3.6',
    '23.3.5',
    '23.3.4',
    '23.3.3',
    '23.3.2',
    '23.3.1',
    '23.3.0',
    '23.2.1',
    '23.1.8',
    '23.1.7',
  ] as const,
  aliases: [] as const,
}

export type Mesa3dorgPackage = typeof mesa3dorgPackage
