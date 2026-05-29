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
  },

  build: {
    script: [
      // versions didn't get bumped in 4.0.0 source; rewrite the hardcoded
      // 3.4.1 string in configure to match the tarball version (no-op for 3.4.1).
      {
        run: [
          'sed -i.bak -e \'s/3\\.4\\.1/{{version}}/g\' configure',
          'rm configure.bak',
        ],
      },
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}'],
    },
  },
}
