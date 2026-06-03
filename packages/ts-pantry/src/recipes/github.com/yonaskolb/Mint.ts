import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/yonaskolb/Mint',
  name: 'Mint',
  programs: [
    'mint',
  ],
  distributable: {
    url: 'git+https://github.com/yonaskolb/Mint.git',
  },
  build: {
    script: [
      'swift build --disable-sandbox -c release',
      'install -D .build/release/mint {{prefix}}/bin/mint',
    ],
  },
  test: {
    script: [
      'mint version | grep {{version}}',
      'mint help | grep \'Swift Package Manager\'',
      'mint install yonaskolb/mint',
      'mint list | grep \'mint\'',
    ],
  },
}
