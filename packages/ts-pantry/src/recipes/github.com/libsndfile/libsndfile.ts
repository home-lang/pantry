import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/libsndfile/libsndfile',
  name: 'libsndfile',
  programs: [
    'sndfile-info',
    'sndfile-convert',
    'sndfile-play',
  ],
  dependencies: {
    'xiph.org/flac': '*',
    'lame.sourceforge.io': '*',
    'xiph.org/ogg': '*',
    'xiph.org/vorbis': '*',
    'mpg123.de': '*',
    'opus-codec.org': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/libsndfile/libsndfile/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DBUILD_SHARED_LIBS=ON',
        '-DBUILD_PROGRAMS=ON',
        '-DENABLE_PACKAGE_CONFIG=ON',
        '-DINSTALL_PKGCONFIG_MODULE=ON',
        '-DBUILD_EXAMPLES=OFF',
        '-DCMAKE_INSTALL_RPATH={{prefix}}',
        '-DPYTHON_EXECUTABLE="$(which python)"',
      ],
    },
  },
  test: {
    script: [
      'SNDFILE_INFO="$(sndfile-info test.wav)"',
      'case "$SNDFILE_INFO" in',
      '  *\'Duration    : 00:00:00.064\'*)',
      '    echo \'Success\'',
      '    ;;',
      '  *)',
      '    echo \'Error\'',
      '    exit 1',
      '    ;;',
      'esac',
    ],
  },
}
