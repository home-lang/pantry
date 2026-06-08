import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mxcl/swift-sh',
  platforms: ['darwin'],
  name: 'swift-sh',
  programs: [
    'swift-sh',
  ],
  distributable: {
    url: 'https://github.com/mxcl/swift-sh/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'swift build --disable-sandbox -c release',
      'mkdir -p {{prefix}}/bin',
      'mv $(swift build --configuration release --show-bin-path)/swift-sh {{prefix}}/bin',
    ],
  },
  test: {
    script: [
      'echo "#!/usr/bin/env swift sh" > test.swift',
      'swift-sh eject test.swift',
      'test -e Test/Package.swift',
    ],
  },
}
