import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cmocka.org',
  name: 'cmocka',
  programs: [],
  distributable: {
    url: 'https://cmocka.org/files/{{version.marketing}}/cmocka-{{version}}.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DWITH_STATIC_LIB=ON', '-DWITH_CMOCKERY_SUPPORT=ON', '-DUNIT_TESTING=ON'],
    },
  },
}
