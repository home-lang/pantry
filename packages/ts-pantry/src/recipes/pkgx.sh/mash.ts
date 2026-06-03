import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pkgx.sh/mash',
  name: 'mash',
  programs: [
    'mash',
  ],
  dependencies: {
    'pkgx.sh': '^1.1,^2',
    'gnu.org/bash': '*',
    'curl.se': '*',
  },
  distributable: {
    url: 'https://github.com/pkgxdev/mash/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i "s/mash 0.0.0-dev/mash {{ version }}/g" ./mash',
      'install -D mash {{prefix}}/bin/mash',
    ],
  },
}
