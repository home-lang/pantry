import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pkgx.sh/cargox',
  name: 'cargox',
  programs: [
    'cargox',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.87',
  },
  distributable: {
    url: 'https://github.com/pkgxdev/cargox/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'cargox semverator validate 1.2.3',
      'cargox semverator eq 1.2.3 1.2.3',
      'cargox semverator neq 1.2.3 1.2.4',
      'cargox semverator gt 1.2.3 1.2.2',
      'cargox semverator lt 1.2.3 1.2.4',
      'test ! $(cargox semverator validate 1.2.three)',
      'test ! $(cargox semverator eq 1.2.3 1.2.4)',
      'test ! $(cargox semverator neq 1.2.3 1.2.3)',
      'test ! $(cargox semverator gt 1.2.3 1.2.4)',
      'test ! $(cargox semverator lt 1.2.3 1.2.2)',
    ],
  },
}
