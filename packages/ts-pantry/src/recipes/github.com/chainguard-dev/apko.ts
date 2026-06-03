import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/chainguard-dev/apko',
  name: 'apko',
  programs: [
    'apko',
  ],
  buildDependencies: {
    'git-scm.org': '*',
    'go.dev': '^1.21',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'git+https://github.com/chainguard-dev/apko',
  },
  build: {
    script: [
      'make apko',
      'make install',
    ],
    env: {
      DESTDIR: '${{ prefix }}/',
      BINDIR: 'bin',
    },
  },
  test: {
    script: [
      'apko version',
      'apko version | grep \'{{version}}\'',
    ],
  },
}
