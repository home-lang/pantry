import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pypa.io/distlib',
  name: 'distlib',
  programs: [],
  dependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'git+https://github.com/pypa/distlib.git',
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
      'python -c \'from distlib.database import DistributionPath;\'',
      'python -c \'import distlib; print(distlib.__version__);\' | grep {{version}}',
    ],
  },
}
