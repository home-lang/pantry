import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/nodenv/node-build',
  name: 'node-build',
  programs: [
    'node-build',
  ],
  dependencies: {
    'openssl.org': '>=3.0.0',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
  },
  distributable: {
    url: 'https://github.com/nodenv/node-build/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './install.sh',
    ],
    env: {
      PREFIX: '{{prefix}}',
    },
  },
  test: {
    script: [
      'node-build --version | grep {{version}}',
    ],
  },
}
