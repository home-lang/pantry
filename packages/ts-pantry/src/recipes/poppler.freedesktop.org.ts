import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'poppler.freedesktop.org',
  name: 'poppler.freedesktop',
  programs: ['pdfattach', 'pdfdetach', 'pdffonts', 'pdfimages', 'pdfinfo', 'pdfseparate', 'pdftocairo', 'pdftohtml', 'pdftoppm', 'pdftops', 'pdftotext', 'pdfunite'],
  dependencies: {
    'boost.org': '>=1.58.0',
    'cairographics.org': '>=1.16.0',
    'curl.se': '*',
    'freedesktop.org/fontconfig': '>=2.13',
    'freetype.org': '>=2.10',
    'gnome.org/glib': '>=2.64',
    'gnome.org/libxml2': '~2.13',
    'libjpeg-turbo.org': '*',
    'libpng.org': '*',
    'openjpeg.org': '*',
    'poppler.freedesktop.org/poppler-data': '*',
    'simplesystems.org/libtiff': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'cmake.org': '>=3.16.0',
  },

  build: {
    script: [
      '# Poppler uses zero-padded month in tarball names (e.g. 26.03.0)',
      'IFS="." read -r YEAR MONTH PATCH <<< "{{version}}"',
      'MONTH_PAD=$(printf "%02d" "$MONTH")',
      'PADDED_VER="${YEAR}.${MONTH_PAD}.${PATCH}"',
      'curl -fSL "https://poppler.freedesktop.org/poppler-${PADDED_VER}.tar.xz" | tar xJ --strip-components=1',
      'cmake -S . -B build_shared $ARGS',
      'cmake --build build_shared',
      'cmake --install build_shared',
      'cmake -S . -B build_static $ARGS -DBUILD_SHARED_LIBS=OFF',
      'cmake --build build_static',
      'install -c build_static/libpoppler.a build_static/cpp/libpoppler-cpp.a {{prefix}}/lib',
      'cd "${{prefix}}/include"',
      'for d in poppler cpp glib; do',
      '  if [ -d $d ]; then',
      '    mv $d/* .',
      '    rmdir $d',
      '    ln -s . $d',
      '  fi',
      'done',
      '',
    ],
    env: {
      'ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DENABLE_QT5=OFF', '-DENABLE_QT6=OFF', '-DENABLE_GLIB=OFF', '-DENABLE_GPGME=OFF', '-DENABLE_NSS3=OFF'],
    },
  },
}
