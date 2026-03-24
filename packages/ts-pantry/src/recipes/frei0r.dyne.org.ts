import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'frei0r.dyne.org',
  name: 'frei0r.dyne',
  programs: [],
  distributable: {
    url: 'https://github.com/dyne/frei0r/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      '# Disable opportunistic linking against Cairo',
      'sed -i.bak -e "s/find_package (Cairo)//" CMakeLists.txt',
      'rm CMakeLists.txt.bak',
      'cmake . $ARGS',
      'make install',
      '',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DWITHOUT_OPENCV=ON', '-DWITHOUT_GAVL=ON'],
    },
  },
}
