import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cesnet/libyang',
  name: 'libyang',
  programs: [
    'yanglint',
    'yangre',
  ],
  dependencies: {
    'pcre.org/v2': '>=10.21',
  },
  buildDependencies: {
    'graphviz.org': '*',
    'doxygen.nl': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/CESNET/libyang/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'cmake ${ARGS} ..',
      'make',
      'make install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'test "$(yangre --version|cut -d\' \' -f2)" = {{version}}',
      'yanglint $FIXTURE',
      '(yanglint $FIXTURE || true) 2>&1 | grep \'Invalid character sequence\'',
    ],
  },
}
