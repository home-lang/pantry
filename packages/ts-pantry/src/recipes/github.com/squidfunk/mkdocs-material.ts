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
        prop: {
          content: [
            'mkdocs-mermaid2-plugin',
            'mkdocs-plugin-progress',
            'mkdocs-include-markdown-plugin',
            'mkdocs-macros-plugin',
            'mkdocs-encriptmail-plugin',
            'mkdocs-exporter',
            'mkdocs-static-i18n',
            'mkdocs-git-revision-date-localized-plugin',
            'mkdocs-git-committers-plugin-2',
            'mkdocs-git-authors-plugin',
          ],
        },
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
