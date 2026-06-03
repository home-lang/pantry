import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jaseg/lolcat',
  name: 'lolcat',
  programs: [
    'lolcat',
  ],
  distributable: {
    url: 'https://github.com/jaseg/lolcat/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} lolcat',
      'mkdir -p {{prefix}}/bin',
      'mv lolcat {{prefix}}/bin',
    ],
  },
  test: {
    script: [
      'lolcat --version | grep "lolcat version {{version.marketing}}"',
    ],
  },
}
