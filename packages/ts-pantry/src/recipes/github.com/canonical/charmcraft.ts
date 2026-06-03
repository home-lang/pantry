import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/canonical/charmcraft',
  name: 'charmcraft',
  programs: [
    'charmcraft',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
    'libgit2.org': '~1.9',
  },
  buildDependencies: {
    'python.org': '~3.13',
  },
  distributable: {
    url: 'https://github.com/canonical/charmcraft/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      {
        run: '${{prefix}}/venv/bin/pip install setuptools',
        if: '>=2.7.4',
      },
      'bkpyvenv seal {{prefix}} charmcraft',
    ],
  },
  test: {
    script: [
      'test "$(charmcraft --version|cut -d\' \' -f 2)" = {{version}}',
      'test "$(charmcraft version)" = {{version}}',
    ],
  },
}
