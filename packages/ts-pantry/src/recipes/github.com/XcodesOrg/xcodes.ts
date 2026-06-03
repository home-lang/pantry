import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/XcodesOrg/xcodes',
  name: 'xcodes',
  programs: [
    'xcodes',
  ],
  distributable: {
    url: 'https://github.com/XcodesOrg/xcodes/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'swift build --configuration release',
      'mkdir -p {{prefix}}/bin',
      'mv $(swift build --configuration release --show-bin-path)/xcodes {{prefix}}/bin',
    ],
  },
}
