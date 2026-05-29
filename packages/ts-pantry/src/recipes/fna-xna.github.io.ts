import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fna-xna.github.io',
  name: 'fna-xna.github',
  description: 'FAudio - Accuracy-focused XAudio reimplementation for open platforms',
  homepage: 'https://fna-xna.github.io/',
  github: 'https://github.com/FNA-XNA/FAudio',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'FNA-XNA/FAudio',
  },
  distributable: {
    url: 'git+https://github.com/FNA-XNA/FAudio.git',
  },
  dependencies: {
    'libsdl.org': '^2.28',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DBUILD_SDL3=OFF',
      ],
    },
  },
}
