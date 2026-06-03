import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'certifi.io/python-certifi',
  name: 'python-certifi',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/certifi/python-certifi/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
  test: {
    script: [
      'python -c \'import certifi;\'',
      'python -m certifi | grep \'{{prefix}}/lib/python{{deps.python.org.version.marketing}}/site-packages/certifi/cacert.pem\'',
      'python -m certifi -h | grep \'usage\'',
    ],
  },
}
