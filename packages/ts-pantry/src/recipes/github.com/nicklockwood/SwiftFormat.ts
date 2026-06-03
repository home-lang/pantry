import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/nicklockwood/SwiftFormat',
  name: 'SwiftFormat',
  programs: [
    'swiftformat',
  ],
  distributable: {
    url: 'https://github.com/nicklockwood/SwiftFormat/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'export TMPDIR=$(mktemp -d)',
      'swift build --configuration release',
      'mkdir -p {{prefix}}/bin',
      'mv $(swift build --configuration release --show-bin-path)/swiftformat {{prefix}}/bin',
    ],
  },
}
