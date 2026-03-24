import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openexr.com',
  name: 'exr',
  description: 'The OpenEXR project provides the specification and reference implementation of the EXR file format, the professional-grade image storage format of the motion picture industry.',
  homepage: 'https://www.openexr.com/',
  github: 'https://github.com/AcademySoftwareFoundation/openexr',
  programs: ['exr2aces', 'exrenvmap', 'exrheader', 'exrmakepreview', 'exrmaketiled', 'exrmultipart', 'exrmultiview', 'exrstdattr'],
  versionSource: {
    type: 'github-releases',
    repo: 'AcademySoftwareFoundation/openexr/tags',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'https://github.com/AcademySoftwareFoundation/openexr/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    'openexr.com/imath': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
    'git-scm.org': '*',
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make install',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX="{{prefix}}"', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
