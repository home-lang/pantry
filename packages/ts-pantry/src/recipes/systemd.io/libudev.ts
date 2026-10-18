import type { Recipe } from '../../../scripts/recipe-types'

/** The upstream libudev target; installing this library never installs a service manager. */
export const recipe: Recipe = {
  domain: 'systemd.io/libudev', name: 'libudev', programs: [], platforms: ['linux'],
  description: 'Native libudev shared library and development interface.',
  homepage: 'https://systemd.io/', github: 'https://github.com/systemd/systemd',
  versionSource: { type: 'github-releases', repo: 'systemd/systemd', tagPattern: /^v(\d+(?:\.\d+)?)$/, stable: true },
  distributable: { url: 'https://github.com/systemd/systemd/archive/refs/tags/v{{version}}.tar.gz', stripComponents: 1 },
  buildDependencies: {
    'mesonbuild.com': '*', 'ninja-build.org': '*', 'freedesktop.org/pkg-config': '*',
    'python.org': '~3.12', 'palletsprojects.com/jinja': '^3', 'gnu.org/gperf': '*',
    'gnu.org/coreutils': '*', 'gnu.org/binutils': '*', 'kernel.org/linux-headers': '*',
  },
  build: {
    script: [
      'meson setup build --prefix={{prefix}} --libdir=lib --buildtype=release -Dmode=release -Dauto_features=disabled -Dtests=false -Dinstall-tests=false -Dtranslations=false',
      'ninja -C build -j{{hw.concurrency}} libudev src/libudev/libudev.pc',
      'meson install -C build --no-rebuild --tags libudev',
      'install -Dm644 src/libudev/libudev.h "{{prefix}}/include/libudev.h"',
      'install -Dm644 build/src/libudev/libudev.pc "{{prefix}}/lib/pkgconfig/libudev.pc"',
      'install -Dm644 LICENSE.LGPL2.1 "{{prefix}}/share/licenses/libudev/LICENSE.LGPL2.1"',
    ],
  },
  test: {
    required: true,
    script: [
      'pkg-config --exists libudev',
      'readelf --dynamic "{{prefix}}/lib/libudev.so.1" | grep -F "[libudev.so.1]"',
      'readelf --version-info "{{prefix}}/lib/libudev.so.1" | grep -F LIBUDEV_183',
      'printf "#include <libudev.h>\nint main(void) { struct udev *context = udev_new(); if (!context) return 1; udev_unref(context); return 0; }\n" > probe.c',
      'cc probe.c $(pkg-config --cflags --libs libudev) -o probe',
      './probe',
    ],
  },
}
