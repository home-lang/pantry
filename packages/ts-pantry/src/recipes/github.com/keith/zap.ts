import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/keith/zap',
  name: 'zap',
  programs: [
    'zap',
  ],
  distributable: {
    url: 'https://github.com/keith/zap/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'mv ./zap {{prefix}}/bin',
    ],
  },
}
