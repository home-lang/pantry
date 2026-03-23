import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'freetype.org',
  name: 'freetype',
  programs: [],
  distributable: {
    url: 'https://download.savannah.gnu.org/releases/freetype/freetype-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libpng.org': '1',
    'zlib.net': '1',
    'sourceware.org/bzip2': '1',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['-DBUILD_SHARED_LIBS=true', '-DCMAKE_INSTALL_PREFIX="{{ prefix }}"', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
