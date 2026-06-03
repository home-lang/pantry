import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/strukturag/libheif',
  name: 'libheif',
  programs: [
    'heif-enc',
    'heif-info',
    'heif-thumbnailer',
  ],
  dependencies: {
    'aomedia.googlesource.com/aom': '*',
    'libjpeg-turbo.org': '*',
    'github.com/strukturag/libde265': '*',
    'libpng.org': '*',
    'freedesktop.org/shared-mime-info': '*',
    'videolan.org/x265': 3.2,
    linux: {
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    'cmake.org': '*',
    linux: {
      'gnu.org/gcc': 14,
    },
  },
  distributable: {
    url: 'https://github.com/strukturag/libheif/releases/download/v{{version}}/libheif-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
      'mkdir -p {{prefix}}/pkgshare',
      'mv ./examples/example.heic {{prefix}}/pkgshare/',
      'mv ./examples/example.avif {{prefix}}/pkgshare/',
      'mkdir -p {{prefix}}/share/mime/packages',
      'update-mime-database {{prefix}}/share/mime',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion libheif | grep {{version}}',
    ],
  },
}
