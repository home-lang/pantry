import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/poppler-qt5',
  name: 'poppler-qt5',
  programs: [
    'pdfattach',
    'pdfdetach',
    'pdffonts',
    'pdfimages',
    'pdfinfo',
    'pdfseparate',
    'pdfsig',
    'pdftocairo',
    'pdftohtml',
    'pdftoppm',
    'pdftops',
    'pdftotext',
    'pdfunite',
  ],
  dependencies: {
    'gnupg.org/libassuan': '^2',
    'cairographics.org': '^1',
    'freedesktop.org/fontconfig': '^2',
    'freetype.org': '^2',
    'gnu.org/gettext': '^0',
    'gnome.org/libxml2': '~2.13',
    'gnome.org/libxslt': '~1.1.44',
    'gnome.org/glib': '^2',
    'gnupg.org/gpgme': '^1',
    'gnupg.org/libgpg-error': '^1',
    'libjpeg-turbo.org': '^2',
    'libpng.org': '^1',
    'simplesystems.org/libtiff': '^4',
    'littlecms.com': '^2',
    'mozilla.org/nss': '^3',
    'openjpeg.org': '^2',
    'qt.io': '~5',
    'curl.se': '^8',
    darwin: {
      'gnupg.org/libassuan': '^2',
    },
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  buildDependencies: {
    'cmake.org': '*',
    'gnome.org/gobject-introspection': '*',
    linux: {
      'gnu.org/binutils': '^2',
      'llvm.org': '~22.1',
    },
  },
  distributable: {
    url: 'https://poppler.freedesktop.org/poppler-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'ORIG_AS="$(command -v as)"\nif echo $ORIG_AS | grep llvm.org; then\n  mv ${ORIG_AS}{,.bak}\nfi\n',
        if: 'linux',
      },
      {
        run: 'cmake .. $CMAKE_ARGS\nmake --jobs {{ hw.concurrency }} install\nmake clean\ncmake .. -DBUILD_SHARED_LIBS=OFF $CMAKE_ARGS\nmake --jobs {{ hw.concurrency }}\ninstall libpoppler.a cpp/libpoppler-cpp.a glib/libpoppler-glib.a {{prefix}}/lib/',
        'working-directory': 'build',
      },
      {
        run: 'curl -L "$FONT_DATA" | tar -xz --strip-components=1\nmake install prefix={{prefix}}',
        'working-directory': 'font-data',
      },
      {
        run: 'if test -e "${ORIG_AS}.bak"; then\n  mv ${ORIG_AS}{.bak,}\nfi\n',
        if: 'linux',
      },
    ],
    env: {
      FONT_DATA: 'https://poppler.freedesktop.org/poppler-data-0.4.12.tar.gz',
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DBUILD_GTK_TESTS=OFF',
        '-DENABLE_BOOST=OFF',
        '-DENABLE_CMS=lcms2',
        '-DENABLE_GLIB=ON',
        '-DENABLE_QT5=ON',
        '-DENABLE_QT6=OFF',
        '-DENABLE_NSS3=OFF',
        '-DENABLE_UNSTABLE_API_ABI_HEADERS=ON',
        '-DRUN_GPERF_IF_PRESENT=OFF',
        '-DWITH_GObjectIntrospection=ON',
      ],
      linux: {
        LDFLAGS: '$LDFLAGS -lstdc++fs',
        CC: 'gcc',
        CXX: 'g++',
        LD: 'ld.gold',
      },
    },
  },
  test: {
    script: [
      'pdfinfo lorem.pdf | grep "Lorem Ipsum"',
      'pkg-config --modversion poppler-qt5 | grep {{version.raw}}',
    ],
  },
}
