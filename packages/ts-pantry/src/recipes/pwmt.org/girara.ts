import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pwmt.org/girara',
  name: 'girara',
  programs: [],
  dependencies: {
    'gtk.org/gtk3': '3',
    'gnome.org/glib': '^2.72',
    'gnome.org/json-glib': '^1',
  },
  buildDependencies: {
    'mesonbuild.com': '>=0.61',
    'ninja-build.org': '*',
    'gnu.org/gettext': '*',
  },
  distributable: {
    url: 'https://github.com/pwmt/girara/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build --prefix={{prefix}}',
      'ninja -C build',
      'ninja -C build install',
    ],
  },
  test: {
    script: [
      'cc -o test $FIXTURE $(pkg-config --cflags --libs girara-gtk3)',
      './test',
    ],
  },
}
