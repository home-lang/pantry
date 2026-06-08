import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'python.org/typing_extensions',
  name: 'typing_extensions',
  programs: [],
  dependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'https://github.com/python/typing_extensions/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // typing_extensions declares `flit_core` as its PEP 517 build backend in
      // pyproject.toml, so pip builds + installs it directly — no standalone
      // `flit` CLI needed (mirrors the sibling pypa.io/packaging & distlib recipes).
      'python -m pip install --prefix={{prefix}} .',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib',
      },
    ],
  },
  test: {
    script: [
      'python -c \'import typing_extensions\'',
    ],
  },
}
