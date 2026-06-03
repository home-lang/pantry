import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/platformdirs/platformdirs',
  name: 'platformdirs',
  programs: [],
  dependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'git+https://github.com/platformdirs/platformdirs.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib',
      },
    ],
  },
  test: {
    script: [
      'python -c \'import platformdirs; print(platformdirs.__version__)\' | grep {{version}}',
    ],
  },
}
