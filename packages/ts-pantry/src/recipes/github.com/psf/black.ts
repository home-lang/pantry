import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/psf/black',
  name: 'black',
  programs: [
    'black',
    'blackd',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.7<3.12',
  },
  distributable: {
    url: 'https://github.com/psf/black/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install \'.[d]\'',
      'bkpyvenv seal {{prefix}} black',
      {
        run: 'cp black blackd',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
  test: {
    script: [
      'test "$(black --version | grep black | sed \'s/.*, \\([^ ]*\\) .*/\\1/\')" = {{ version }}',
      'test "$(blackd --version | sed \'s/.* //\')" = {{ version }}',
    ],
  },
}
