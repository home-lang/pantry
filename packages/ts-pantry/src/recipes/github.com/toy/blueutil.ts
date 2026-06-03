import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/toy/blueutil',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'blueutil',
  programs: [
    'blueutil',
  ],
  distributable: {
    url: 'git+https://github.com/toy/blueutil',
    stripComponents: 1,
  },
  build: {
    script: [
      'xcodebuild -arch $(uname -m) SDKROOT= SYMROOT=build',
      'mkdir -p {{prefix}}/bin',
      'install build/Release/blueutil {{prefix}}/bin/',
    ],
  },
  test: {
    script: [
      'blueutil --version | grep {{version}}',
    ],
  },
}
