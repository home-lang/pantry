import type { Recipe } from '../../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/regclient/regclient/regbot',
  name: 'regbot',
  programs: [
    'regbot',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/regclient/regclient',
  },
  build: {
    script: [
      'make bin/regbot',
      'mkdir -p \'{{ prefix }}/bin\'',
      'mv -f ./bin/regbot \'{{ prefix }}/bin\'',
    ],
  },
  test: {
    script: [
      'regbot version | tee /dev/stderr | grep -q -w "v{{ version }}"',
    ],
  },
}
