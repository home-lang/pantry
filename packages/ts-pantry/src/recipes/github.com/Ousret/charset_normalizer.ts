import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Ousret/charset_normalizer',
  name: 'charset_normalizer',
  programs: [
    'normalizer',
  ],
  dependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'git+https://github.com/Ousret/charset_normalizer.git',
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} normalizer',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/venv/lib',
      },
    ],
  },
  test: {
    script: [
      'python -c \'import charset_normalizer; print(charset_normalizer.__version__)\' | grep {{version}}',
      'normalizer --version | grep {{version}}',
      'echo "Hello, World!" > test.txt',
      'normalizer test.txt | grep \'English\'',
    ],
  },
}
