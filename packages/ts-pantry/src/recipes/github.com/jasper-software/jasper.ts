import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jasper-software/jasper',
  name: 'jasper',
  programs: [
    'jasper',
  ],
  dependencies: {
    'libjpeg-turbo.org': '^2',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/jasper-software/jasper/releases/download/version-{{version}}/jasper-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '-DJAS_ENABLE_DOC=OFF',
        '-DJAS_ENABLE_AUTOMATIC_DEPENDENCIES=false',
        '-DJAS_ENABLE_SHARED=ON',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
    },
  },
}
