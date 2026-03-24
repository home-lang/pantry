import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openslide.org',
  name: 'openslide',
  description: 'C library to read whole-slide images (a.k.a. virtual slides)',
  homepage: 'https://openslide.org/',
  github: 'https://github.com/openslide/openslide',
  programs: ['openslide-quickhash1sum', 'openslide-show-properties', 'openslide-write-png'],
  versionSource: {
    type: 'github-releases',
    repo: 'openslide/openslide',
  },
  distributable: {
    url: 'https://github.com/openslide/openslide/releases/download/v{{version}}/openslide-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'cairographics.org': '*',
    'gnome.org/gdk-pixbuf': '*',
    'gnome.org/glib': '*',
    'libjpeg-turbo.org': '*',
    'libpng.org': '*',
    'simplesystems.org/libtiff': '*',
    'gnome.org/libxml2': '*',
    'openjpeg.org': '*',
    'sqlite.org': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },

  build: {
    script: [
      'meson setup build --prefix="$PREFIX" --libdir="$PREFIX/lib" --buildtype=release',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}'],
    },
  },
}
