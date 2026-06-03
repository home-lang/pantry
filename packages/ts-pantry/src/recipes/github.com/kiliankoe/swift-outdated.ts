import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kiliankoe/swift-outdated',
  name: 'swift-outdated',
  programs: [
    'swift-outdated',
  ],
  distributable: {
    url: 'https://github.com/kiliankoe/swift-outdated/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -f $PROP SwiftOutdated.swift',
        'working-directory': 'Sources/SwiftOutdated',
      },
      'swift build --configuration release',
      'mkdir -p {{prefix}}/bin',
      'mv $(swift build --configuration release --show-bin-path)/swift-outdated {{prefix}}/bin',
    ],
  },
  test: {
    script: [
      'swift-outdated --version | tee out',
      'grep {{version}} out',
    ],
  },
}
