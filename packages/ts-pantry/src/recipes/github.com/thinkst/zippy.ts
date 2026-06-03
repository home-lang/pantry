import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thinkst/zippy',
  name: 'zippy',
  programs: [
    'zippy',
  ],
  dependencies: {
    'python.org': '~3.10',
  },
  distributable: {
    url: 'https://github.com/thinkst/zippy/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/zippy',
    ],
  },
  test: {
    script: [
      'test "[[ $(echo \'This is a human-written test string, trust me!\' | zippy -s) =~ \'Human\' ]]"',
    ],
  },
}
