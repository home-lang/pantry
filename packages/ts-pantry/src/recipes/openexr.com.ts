import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openexr.com',
  name: 'exr',
  description: 'The OpenEXR project provides the specification and reference implementation of the EXR file format, the professional-grade image storage format of the motion picture industry.',
  homepage: 'https://www.openexr.com/',
  github: 'https://github.com/AcademySoftwareFoundation/openexr',
  programs: ['exr2aces', 'exrenvmap', 'exrheader', 'exrmakepreview', 'exrmaketiled', 'exrmultipart', 'exrmultiview', 'exrstdattr'],
  versionSource: {
    type: 'github-tags',
    repo: 'AcademySoftwareFoundation/openexr',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/AcademySoftwareFoundation/openexr/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    'openexr.com/imath': '*',
    linux: {
      'gnu.org/gcc/libstdcxx': '14', // needed since 3.4.0
    },
  },
  buildDependencies: {
    'cmake.org': '*',
    'git-scm.org': '*',
    linux: {
      'kernel.org/linux-headers': '*', // needs HWCAP2_SVE2 for aarch64 since 3.4.0
      'gnu.org/gcc': '14',
    },
  },

  build: {
    workingDirectory: 'build',
    script: [
      'cmake .. $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
      linux: {
        ARGS: [
          // since 3.3.0
          '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-lstdc++fs',
        ],
      },
    },
  },
}
