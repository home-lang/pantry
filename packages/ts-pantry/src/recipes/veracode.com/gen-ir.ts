import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'veracode.com/gen-ir',
  platforms: ['darwin'],
  name: 'gen-ir',
  programs: [
    'gen-ir',
  ],
  distributable: {
    url: 'https://github.com/veracode/gen-ir/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'swift build -c release --disable-sandbox',
      'install -D .build/release/gen-ir {{prefix}}/bin/gen-ir',
    ],
  },
  test: {
    script: [
      'exit 0',
      'gen-ir --help',
      'gen-ir --version | grep {{version}}',
    ],
  },
}
