import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/squidfunk/mkdocs-material',
  name: 'mkdocs-material',
  programs: [
    'mkdocs',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
    'sass-lang.com/libsass': '^3.6',
  },
  buildDependencies: {
    'python.org': '>=3<3.12',
    'linux/aarch64': {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/squidfunk/mkdocs-material/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cat $PROP >> requirements.txt',
      },
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} mkdocs',
    ],
  },
  test: {
    script: [
      'mkdir docs',
      'mv index.md docs/',
      'mkdocs -v build',
    ],
  },
}
