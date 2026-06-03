import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pyyaml.org/libyaml',
  name: 'libyaml',
  programs: [],
  buildDependencies: {
    'gnu.org/libtool': '*',
    'gnu.org/autoconf': '*',
  },
  distributable: {
    url: 'https://github.com/yaml/libyaml/releases/download/{{version}}/yaml-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
      ],
    },
  },
  test: {
    script: [
      'cc fixture.c -lyaml -o test',
    ],
  },
}
