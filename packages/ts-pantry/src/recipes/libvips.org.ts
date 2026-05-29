import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libvips.org',
  name: 'vips',
  description: 'A fast image processing library with low memory needs.',
  homepage: 'https://libvips.github.io/libvips/',
  github: 'https://github.com/libvips/libvips',
  programs: ['vips', 'vipsedit', 'vipsheader', 'vipsprofile', 'vipsthumbnail'],
  versionSource: {
    type: 'github-releases',
    repo: 'libvips/libvips',
  },
  distributable: {
    url: 'https://github.com/libvips/libvips/releases/download/v{{version}}/vips-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'mozilla.org/mozjpeg': '*',
    'cairographics.org': '*',
    'heasarc.gsfc.nasa.gov/cfitsio': '*',
    'github.com/dloebl/cgif': '*',
    'fftw.org': '*',
    'freedesktop.org/fontconfig': '*',
    'gnu.org/gettext': '*',
    'gnome.org/glib': '*',
    'graphicsmagick.org': '*',
    'jpeg.org/jpegxl': '*',
    'libexif.github.io': '*',
    'gnome.org/libgsf': '*',
    'github.com/strukturag/libheif': '*',
    'pngquant.org/lib': '*',
    'matio.sourceforge.io': '*',
    'gnome.org/librsvg': '*',
    'libspng.org': '*',
    'simplesystems.org/libtiff': '*',
    'littlecms.com': '*',
    'openexr.com': '*',
    'openjpeg.org': '*',
    'gstreamer.freedesktop.org/orc': '*',
    'gnome.org/pango': '*',
    'poppler.freedesktop.org': '*',
    'google.com/webp': '*',
    'libexpat.github.io': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnome.org/gobject-introspection': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    // 8.18.1 had avx-512 issues with highway
    'linux': { 'gnu.org/gcc': '14' },
  },

  build: {
    script: [
      'meson setup build $MESON_ARGS',
      'meson compile -C build',
      'meson install -C build',
    ],
    env: {
      'MESON_ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--buildtype=release', '--wrap-mode=nofallback'],
      'darwin': {
        CFLAGS: '$CFLAGS -Wno-incompatible-function-pointer-types',
      },
      'linux': {
        LDFLAGS: '$LDFLAGS -Wl,-lstdc++fs',
      },
      // __extendhfsf2 is hidden in libgcc.a; use shared libgcc so g-i introspection can link
      'linux/x86-64': {
        LDFLAGS: '$LDFLAGS -shared-libgcc',
      },
    },
  },
}
