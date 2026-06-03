import type { Recipe } from '../../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/regclient/regclient/regsync',
  name: 'regsync',
  programs: [
    'regsync',
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
      'make bin/regsync',
      'mkdir -p \'{{ prefix }}/bin\'',
      'mv -f ./bin/regsync \'{{ prefix }}/bin\'',
    ],
  },
  test: {
    script: [
      'regsync version | tee /dev/stderr | grep -q -w "v{{ version }}"',
    ],
  },
}
