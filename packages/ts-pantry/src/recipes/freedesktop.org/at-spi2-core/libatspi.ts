import type { Recipe } from '../../../../scripts/recipe-types'

/** Client ABI matching the independently packaged ATK 2.38 bridge. */
export const recipe: Recipe = {
  domain: 'freedesktop.org/at-spi2-core/libatspi',
  name: 'libatspi',
  description: 'AT-SPI accessibility client library',
  homepage: 'https://gitlab.gnome.org/GNOME/at-spi2-core',
  platforms: ['linux'],
  programs: [],
  versionSource: { type: 'url-pattern', url: 'https://download.gnome.org/sources/at-spi2-core/{{version.marketing}}/at-spi2-core-{{version}}.tar.xz', knownVersions: ['2.38.0'] },
  dependencies: { 'gnome.org/glib': '^2', 'freedesktop.org/dbus': '^1' },
  buildDependencies: {
    'mesonbuild.com': '*', 'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '^0.29', 'python.org': '~3.12',
    'gnu.org/gettext': '*', 'gnu.org/coreutils': '*', 'bun.com': '^1.3',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/at-spi2-core/{{version.marketing}}/at-spi2-core-{{version}}.tar.xz',
    stripComponents: 1,
  },
  publish: { include: ['lib/libatspi.so*', 'lib/pkgconfig/atspi-2.pc', 'include/**', 'share/licenses/**'] },
  build: {
    script: [
      'meson setup build --prefix={{prefix}} --libdir=lib --buildtype=release --wrap-mode=nofallback -Dintrospection=no -Dx11=no -Ddocs=false -Ddbus_daemon=dbus-daemon',
      'ninja -C build',
      'ninja -C build install',
      'mkdir -p {{prefix}}/share/licenses/libatspi',
      'cp COPYING {{prefix}}/share/licenses/libatspi/COPYING',
    ],
  },
  test: {
    required: true,
    script: [
      'env -u LD_LIBRARY_PATH -u DYLD_LIBRARY_PATH -u DYLD_FALLBACK_LIBRARY_PATH bun -e \'import { dlopen, FFIType } from "bun:ffi"; const lib = dlopen("{{prefix}}/lib/libatspi.so.0", { atspi_role_get_name: { args: [FFIType.i32], returns: FFIType.cstring } }); if (String(lib.symbols.atspi_role_get_name(0)) !== "invalid") throw new Error("AT-SPI client ABI failed"); console.log("ATSPI_CLIENT_OK"); lib.close()\'',
    ],
  },
}
