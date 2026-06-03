import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/unsignedapps/swift-create-xcframework',
  name: 'swift-create-xcframework',
  programs: [
    'swift-create-xcframework',
  ],
  distributable: {
    url: 'https://github.com/unsignedapps/swift-create-xcframework/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'swift build --configuration release',
      'install -D $(swift build --configuration release --show-bin-path)/swift-create-xcframework {{prefix}}/bin/swift-create-xcframework',
    ],
  },
}
