/**
 * **qt** - pkgx package
 *
 * @domain `qt.io`
 * @programs `balsam`, `canbusutil`, `lconvert`, `lprodump`, `lrelease`, ... (+38 more)
 * @version `5.15.10` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install qt.io`
 * @dependencies `freetype.org`, `gnome.org/glib`, `libjpeg-turbo.org`, ... (+37 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `nodejs.org`, `python.org@>=2.7`, `gnu.org/gperf`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.qtio
 * console.log(pkg.name)        // "qt"
 * console.log(pkg.programs)    // ["balsam", "canbusutil", ...]
 * console.log(pkg.versions[0]) // "5.15.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/qt-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const qtioPackage = {
  /**
   * The display name of this package.
   */
  name: 'qt' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'qt.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/qt.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install qt.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +qt.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install qt.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'balsam',
    'canbusutil',
    'lconvert',
    'lprodump',
    'lrelease',
    'lrelease-pro',
    'lupdate',
    'lupdate-pro',
    'meshdebug',
    'moc',
    'qcollectiongenerator',
    'qdbus',
    'qdbuscpp2xml',
    'qdbusxml2cpp',
    'qdistancefieldgenerator',
    'qhelpgenerator',
    'qlalr',
    'qmake',
    'qmlcachegen',
    'qmleasing',
    'qmlformat',
    'qmlimportscanner',
    'qmllint',
    'qmlmin',
    'qmlplugindump',
    'qmlpreview',
    'qmlprofiler',
    'qmlscene',
    'qmltestrunner',
    'qmltime',
    'qmltyperegistrar',
    'qscxmlc',
    'qtattributionsscanner',
    'qtdiag',
    'qtpaths',
    'qtplugininfo',
    'qvkgen',
    'rcc',
    'repc',
    'tracegen',
    'uic',
    'xmlpatterns',
    'xmlpatternsvalidator',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'freetype.org',
    'gnome.org/glib',
    'libjpeg-turbo.org',
    'libpng.org',
    'pcre.org/v2',
    'google.com/webp',
    'gnu.org/bison',
    'github.com/westes/flex',
    'kerberos.org',
    'gnome.org/libxslt',
    'sqlite.org',
    'unicode.org^71',
    'linux:alsa-project.org/alsa-lib',
    'linux:freedesktop.org/fontconfig',
    'linux:harfbuzz.org',
    'linux:unicode.org~71',
    'linux:dri.freedesktop.org',
    'linux:libevent.org',
    'linux:x.org/ice',
    'linux:x.org/sm',
    'linux:webmproject.org/libvpx',
    'linux:x.org/xcomposite',
    'linux:xkbcommon.org~1.5',
    'linux:x.org/xkbfile',
    'linux:x.org/xrandr',
    'linux:x.org/xtst',
    'linux:mesa3d.org',
    'linux:zlib.net/minizip',
    'linux:mozilla.org/nss',
    'linux:opus-codec.org',
    'linux:libsdl.org',
    'linux:google.github.io/snappy',
    'linux:systemd.io',
    'linux:wayland.freedesktop.org',
    'linux:freedesktop.org/xcb-util',
    'linux:freedesktop.org/xcb-util-image',
    'linux:freedesktop.org/xcb-util-keysyms',
    'linux:freedesktop.org/xcb-util-renderutil',
    'linux:freedesktop.org/xcb-util-wm',
    'linux:facebook.com/zstd',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'nodejs.org',
    'python.org@>=2.7',
    'gnu.org/gperf',
    'perl.org@>=5.12',
    'linux:llvm.org@<16',
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.15.10',
  ] as const,
  aliases: [] as const,
}

export type QtioPackage = typeof qtioPackage
