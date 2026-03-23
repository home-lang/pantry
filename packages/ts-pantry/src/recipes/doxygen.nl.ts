import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'doxygen.nl',
  name: 'doxygen',
  description: 'Generate documentation for several programming languages',
  homepage: 'https://www.doxygen.nl/',
  github: 'https://github.com/doxygen/doxygen',
  programs: ['doxygen'],
  versionSource: {
    type: 'github-releases',
    repo: 'doxygen/doxygen/releases',
    tagPattern: /\/Doxygen release \//,
  },
  distributable: {
    url: 'https://github.com/doxygen/doxygen/archive/refs/tags/Release_{{version.major}}_{{version.minor}}_{{version.patch}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/bison': '>=2.7',
    'cmake.org': '^3',
    'github.com/westes/flex': '2',
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'cmake $ARGS -G "Unix Makefiles" ..',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX="{{prefix}}"', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
