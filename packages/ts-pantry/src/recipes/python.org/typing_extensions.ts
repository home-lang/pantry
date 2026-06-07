import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'python.org/typing_extensions',
  name: 'typing_extensions',
  programs: [],
  buildDependencies: {
    'flit.pypa.io': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/python/typing_extensions/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'flit build --format wheel',
      'python -m pip install --prefix={{prefix}} dist/typing_extensions-*.whl',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}\nln -s python{{deps.python.org.version.major}} python\n',
        'working-directory': '{{prefix}}/lib',
      },
    ],
  },
  test: {
    script: [
      'python -c "import typing_extensions"',
    ],
  },
}
