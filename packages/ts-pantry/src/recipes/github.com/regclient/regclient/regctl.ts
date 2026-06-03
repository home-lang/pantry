import type { Recipe } from '../../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/regclient/regclient/regctl',
  name: 'regctl',
  programs: [
    'regctl',
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
      'make bin/regctl',
      'mkdir -p \'{{ prefix }}/bin\'',
      'mv -f ./bin/regctl \'{{ prefix }}/bin\'',
    ],
  },
  test: {
    script: [
      'regctl version | tee /dev/stderr | grep -q -w "v{{ version }}"',
      'OUT="$(regctl image inspect hello-world --platform linux/amd64)"',
      'echo "$OUT" | grep -q -w \'"Image":\'',
      'echo "$OUT" | grep -q -w \'"/hello"\'',
    ],
  },
}
