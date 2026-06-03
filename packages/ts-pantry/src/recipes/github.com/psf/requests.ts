import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/psf/requests',
  name: 'requests',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
    'github.com/Ousret/charset_normalizer': '^3',
    'github.com/kjd/idna': '^3',
    'github.com/urllib3/urllib3': '^2',
    'certifi.io/python-certifi': '^2024',
  },
  distributable: {
    url: 'https://github.com/psf/requests/releases/download/{{version.tag}}/requests-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'pip install --prefix={{prefix}} .',
    ],
  },
}
