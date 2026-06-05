import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pwmt.org/zathura',
  name: 'zathura',
  programs: [
    'zathura',
  ],
  dependencies: {
    'gnome.org/glib': '^2.72',
    'gnome.org/adwaita-icon-theme': '*',
    'gnu.org/gettext': '*',
    'freedesktop.org/appstream': '*',
    'pwmt.org/girara': '^2026',
    'freedesktop.org/intltool': '*',
    'freedesktop.org/desktop-file-utils': '*',
    'darwinsys.com/file': '*',
    'gtk.org/gtk3': '^3.22',
    'sqlite.org': '3',
    darwin: {
      'gnome.org/gtk-mac-integration-gtk3': '*',
    },
  },
  buildDependencies: {
    'mesonbuild.com': '>=0.61',
    'ninja-build.org': '*',
    'cmake.org': '3',
    linux: {
      'nixos.org/patchelf': '*',
    },
  },
  distributable: {
    url: 'https://github.com/pwmt/zathura/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/girara_warn(/girara_warning(/g\' main.c',
        'working-directory': 'zathura',
      },
      'meson setup build --prefix={{prefix}} -Dmanpages=disabled',
      'ninja -C build',
      'ninja -C build install',
      {
        run: 'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/pkgconfig/../../lib/libsqlite3.so libsqlite3.so zathura',
        if: 'linux',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      darwin: {
        MACOSX_DEPLOYMENT_TARGET: '14',
      },
    },
  },
}
