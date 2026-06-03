import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/gi-docgen',
  name: 'gi-docgen',
  programs: [],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gi-docgen/{{version.major}}/gi-docgen-{{version.marketing}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} gi-docgen',
    ],
  },
  test: {
    script: [
      'cp $FIXTURE pkgx.toml',
      'gi-docgen generate -C pkgx.toml $FIXTURE | grep \'Creating namespace index file for pkgx-1.0\'',
      'grep "Website.*>https://pkgx.sh/" pkgx-1.0/index.html',
      'grep "struct.*Formula.*{" pkgx-1.0/struct.Formula.html',
    ],
  },
}
