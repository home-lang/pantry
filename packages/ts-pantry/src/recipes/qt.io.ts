import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'qt.io',
  name: 'qt',
  programs: ['balsam', 'canbusutil', 'lconvert', 'lprodump', 'lrelease', 'lrelease-pro', 'lupdate', 'lupdate-pro', 'meshdebug', 'moc', 'qcollectiongenerator', 'qdbus', 'qdbuscpp2xml', 'qdbusxml2cpp', 'qdistancefieldgenerator', 'qhelpgenerator', 'qlalr', 'qmake', 'qmlcachegen', 'qmleasing', 'qmlformat', 'qmlimportscanner', 'qmllint', 'qmlmin', 'qmlplugindump', 'qmlpreview', 'qmlprofiler', 'qmlscene', 'qmltestrunner', 'qmltime', 'qmltyperegistrar', 'qscxmlc', 'qtattributionsscanner', 'qtdiag', 'qtpaths', 'qtplugininfo', 'qvkgen', 'rcc', 'repc', 'tracegen', 'uic', 'xmlpatterns', 'xmlpatternsvalidator'],
  distributable: {
    url: 'https://download.qt.io/official_releases/qt/{{version.marketing}}/{{version}}/single/qt-everywhere-opensource-src-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'freetype.org': '*',
    'gnome.org/glib': '*',
    'libjpeg-turbo.org': '*',
    'libpng.org': '*',
    'pcre.org/v2': '*',
    'google.com/webp': '*',
    'gnu.org/bison': '*',
    'github.com/westes/flex': '*',
    'kerberos.org': '*',
    'gnome.org/libxslt': '*',
    'sqlite.org': '*',
    'unicode.org': '^71',
  },
  buildDependencies: {
    'nodejs.org': '*',
    'freedesktop.org/pkg-config': '*',
    'python.org': '>=2.7',
    'gnu.org/gperf': '*',
    'perl.org': '>=5.12',
    'ruby-lang.org': '>=1.9.3',
  },

  build: {
    script: [
      'cd "qtbase/src/corelib"',
      'mkdir -p .rcc',
      'perl mimetypes/mime/generate.pl mimetypes/mime/packages/freedesktop.org.xml > .rcc/qmimeprovider_database.cpp',
      '',
      'cd "qtlocation/src/3rdparty/mapbox-gl-native/include/mbgl/util"',
      'sed -i.bak -e\'/#include <stdexcept>/a\\',
      '#include <utility> // std::move\\',
      '\' unique_any.hpp',
      'rm unique_any.hpp.bak',
      '',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make -j1 install',
    ],
    env: {
      'ARGS': ['-verbose', '-prefix {{prefix}}', '-release', '-opensource -confirm-license', '-nomake examples', '-nomake tests', '-pkg-config', '-dbus-runtime', '-proprietary-codecs', '-system-freetype', '-system-libjpeg', '-system-libpng', '-system-pcre', '-system-zlib'],
    },
  },
}
