import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/desktop-file-utils',
  name: 'desktop-file-utils',
  programs: [
    'desktop-file-edit',
    'desktop-file-install',
    'desktop-file-validate',
    'update-desktop-database',
  ],
  dependencies: {
    'gnome.org/glib': 2,
  },
  buildDependencies: {
    'mesonbuild.com': '>=0.61',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://www.freedesktop.org/software/desktop-file-utils/releases/desktop-file-utils-{{ version.raw }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build --prefix={{prefix}}',
      'meson compile -C build',
      'meson install -C build',
    ],
  },
  test: {
    script: [
      'desktop-file-validate $FIXTURE',
    ],
  },
}
