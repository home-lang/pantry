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
    // clang's c++20 std lib isn't sufficient on Linux (per pkgx)
    'linux': {
      'gnu.org/gcc/libstdcxx': '14',
    },
  },
  buildDependencies: {
    'cmake.org': '>=3.16.0',
    'linux': {
      'gnu.org/gcc': '14',
    },
  },

  build: {
    script: [
      '# Poppler uses zero-padded month in tarball names (e.g. 26.03.0)',
      'IFS="." read -r YEAR MONTH PATCH <<< "{{version}}"',
      '# force base-10 so an already-padded month (e.g. 08/09) is not parsed as octal',
      'MONTH_PAD=$(printf "%02d" "$((10#$MONTH))")',
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
      // gettid() and C++ filesystem references need PIC + relaxed link on Linux (mirrors pkgx)
      'linux/x86-64': {
        ARGS: ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DENABLE_QT5=OFF', '-DENABLE_QT6=OFF', '-DENABLE_GLIB=OFF', '-DENABLE_GPGME=OFF', '-DENABLE_NSS3=OFF', '-DCMAKE_C_FLAGS=-fPIC', '-DCMAKE_CXX_FLAGS=-fPIC', '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-pie,-lstdc++fs,--unresolved-symbols=ignore-in-shared-libs'],
        LDFLAGS: '$LDFLAGS -Wl,--unresolved-symbols=ignore-in-shared-libs',
      },
      'linux/aarch64': {
        ARGS: ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DENABLE_QT5=OFF', '-DENABLE_QT6=OFF', '-DENABLE_GLIB=OFF', '-DENABLE_GPGME=OFF', '-DENABLE_NSS3=OFF', '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-lstdc++fs,--unresolved-symbols=ignore-in-shared-libs'],
        LDFLAGS: '$LDFLAGS -Wl,--unresolved-symbols=ignore-in-shared-libs',
      },
    },
  },
}
