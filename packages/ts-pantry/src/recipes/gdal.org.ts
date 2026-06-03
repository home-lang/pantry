import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gdal.org',
  name: 'gdal',
  description: 'GDAL is an open source MIT licensed translator library for raster and vector geospatial data formats.',
  homepage: 'https://www.gdal.org/',
  github: 'https://github.com/OSGeo/gdal',
  programs: ['gdaladdo', 'gdalbuildvrt', 'gdal-config', 'gdal_contour', 'gdal_create', 'gdaldem', 'gdalenhance', 'gdal_grid', 'gdalinfo', 'gdallocationinfo', 'gdalmanage', 'gdalmdiminfo', 'gdalmdimtranslate', 'gdal_rasterize', 'gdalsrsinfo', 'gdaltindex', 'gdaltransform', 'gdal_translate', 'gdal_viewshed', 'gdalwarp', 'gnmanalyse', 'gnmmanage', 'nearblack', 'ogr2ogr', 'ogrinfo', 'ogrlineref', 'ogrtindex', 'sozip'],
  versionSource: {
    type: 'github-releases',
    repo: 'OSGeo/gdal',
  },
  distributable: {
    url: 'https://github.com/OSGeo/gdal/releases/download/v{{version}}/gdal-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'apache.org/arrow': '19',
    'heasarc.gsfc.nasa.gov/cfitsio': '*',
    'epsilon-project.sourceforge.io': '*',
    'libexpat.github.io': '*',
    'gaia-gis.it/fossil/freexl': '*',
    'libgeos.org': '*',
    'giflib.sourceforge.io': '*',
    'libjpeg-turbo.org': '*',
    'jpeg.org/jpegxl': '*',
    'github.com/json-c/json-c': '*',
    'libarchive.org': '*',
    'github.com/OSGeo/libgeotiff': '*',
    'github.com/strukturag/libheif': '*',
    'github.com/libkml/libkml': '*',
    'github.com/Esri/lerc': '*',
    'libpng.org': '*',
    'postgresql.org/libpq': '*',
    'gaia-gis.it/libspatialite': '*',
    'simplesystems.org/libtiff': '*',
    'gnome.org/libxml2': '~2.13',
    'numpy.org': '*',
    'openexr.com': '*',
    'openjpeg.org': '*',
    'openssl.org': '*',
    'pcre.org/v2': '*',
    'poppler.freedesktop.org': '*',
    'proj.org': '*',
    'python.org': '~3.11',
    'qhull.org': '*',
    'sqlite.org': '*',
    'unixodbc.org': '*',
    'google.com/webp': '*',
    'xerces.apache.org/xerces-c': '*',
    'tukaani.org/xz': '*',
    'facebook.com/zstd': '*',
    'protobuf.dev': '*',
    'abseil.io': '*',
    'zlib.net': '*',
    'dkrz.de/libaec': '*',
    'github.com/ebiggers/libdeflate': '*',
    linux: {
      'curl.se': '*',
      'gnu.org/gcc/libstdcxx': '14',
      'github.com/util-linux/util-linux': '*',
      'apache.org/thrift': '=0.22.0',
    },
  },
  buildDependencies: {
    'boost.org': '*',
    'cmake.org': '*',
    'swig.org': '*',
    'doxygen.nl': '*',
    linux: {
      'gnu.org/gcc': '14',
      'nixos.org/patchelf': '*',
    },
  },

  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      {
        run: [
          'sed -i "s|{{prefix}}|\\$(dirname \\$0)/..|g" gdal-config',
          'sed -i "s|{{pkgx.prefix}}|\\$(dirname \\$0)/../../..|g" gdal-config',
        ],
        'working-directory': '{{prefix}}/bin',
      },
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '{{prefix}}/lib',
      },
      // sqlite3 full path in the bins
      {
        run: [
          'ldd lib/libgdal.so',
          'ldd bin/gdalinfo',
          'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so lib/libgdal.so',
          'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so bin/gdalinfo',
          'ldd lib/libgdal.so',
          'ldd bin/gdalinfo',
        ],
        if: 'linux',
        'working-directory': '{{prefix}}',
      },
    ],
    env: {
      'CC': 'clang',
      'CXX': 'clang++',
      'LD': 'clang',
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DENABLE_PAM=ON', '-DCMAKE_CXX_STANDARD=17', '-DCMAKE_CXX_STANDARD_REQUIRED=ON'],
      // otherwise it uses libdeflate from openexr — but only force-link our copy
      // when it actually exists at the resolved dep prefix. When the libdeflate
      // dep has no published binary the prefix falls back to a system path
      // (e.g. /usr) and a hardcoded /usr/lib/libdeflate.dylib makes clang fail
      // with "no such file or directory". Guard with a shell test so CMake's own
      // FindDeflate (via CMAKE_PREFIX_PATH / Homebrew) can resolve it instead.
      'darwin': {
        LDFLAGS: '$LDFLAGS $([ -f {{deps.github.com/ebiggers/libdeflate.prefix}}/lib/libdeflate.dylib ] && echo {{deps.github.com/ebiggers/libdeflate.prefix}}/lib/libdeflate.dylib)',
      },
      'linux': {
        CC: 'gcc',
        CXX: 'g++',
        LD: 'gcc',
        CMAKE_ARGS: ['-DCMAKE_EXE_LINKER_FLAGS=-Wl,--allow-shlib-undefined'],
        LDFLAGS: '$LDFLAGS $([ -f {{deps.github.com/ebiggers/libdeflate.prefix}}/lib/libdeflate.so ] && echo {{deps.github.com/ebiggers/libdeflate.prefix}}/lib/libdeflate.so)',
      },
    },
  },
}
