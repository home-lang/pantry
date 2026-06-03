import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'astral.sh/ty',
  name: 'ty',
  programs: [
    'ty',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
    'python.org': '~3.13',
    'maturin.rs': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/astral-sh/ty',
  },
  build: {
    script: [
      'git submodule update --init --recursive',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} ty',
    ],
  },
  test: {
    script: [
      'ty help',
      'ty version',
      'ty check $FIXTURE',
      '(ty check $FIXTURE || true) | grep unsupported-operator',
      'ty check $FIXTURE',
    ],
  },
}
