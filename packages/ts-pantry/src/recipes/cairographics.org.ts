import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cairographics.org',
  name: 'cairo-trace',
  description: 'Vector graphics library with cross-device output support',
  homepage: 'https://cairographics.org/',
  programs: ['cairo-trace'],
  distributable: {
    url: 'https://cairographics.org/releases/cairo-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'libpng.org': '1',
    'pixman.org': '^0.40.0',
    'freetype.org': '2',
    'gnome.org/glib': '2',
    'freedesktop.org/fontconfig': '2',
    'sourceware.org/bzip2': '1',
    'x.org/x11': '*',
    'x.org/xcb': '*',
    'x.org/exts': '*',
    'x.org/xrender': '*',
    'oberhumer.com/lzo': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'libexpat.github.io': '=2.4.9',
    'gnome.org/gobject-introspection': '1',
    'gnu.org/libtool': '^2',
    'mesonbuild.com': '^1',
    'ninja-build.org': '^1',
  },

  build: {
    script: [
      {
        run: [
          './configure --prefix={{prefix}} --disable-dependency-tracking',
          'make --jobs {{hw.concurrency}}',
          'make install',
        ],
        if: '<1.18.0',
      },
      {
        run: [
          'meson setup build --prefix={{prefix}} --buildtype=release $ARGS',
          'ninja -C build',
          'ninja -C build install',
        ],
        if: '>=1.18.0',
      },
      'rm -rf {{prefix}}/share',
      {
        run: [
          'if [ -d cairo ]; then',
          '  tmp_dir=cairo',
          'else',
          '  tmp_dir=$(ls)',
          'fi',
          'mv $tmp_dir/* .',
          'rmdir $tmp_dir',
          'ln -s . $tmp_dir',
        ],
        'working-directory': '{{prefix}}/lib',
      },
    ],
    env: {
      'ARGS': ['-Dfreetype=enabled', '-Dfontconfig=enabled', '-Dpng=enabled', '-Dglib=enabled', '-Dxcb=enabled', '-Dxlib=enabled', '-Dzlib=enabled', '-Dglib=enabled'],
    },
  },
}
