import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wix.com/applesimutils',
  name: 'applesimutils',
  programs: [
    'applesimutils',
  ],
  distributable: {
    url: 'git+https://github.com/wix/AppleSimulatorUtils',
  },
  build: {
    script: [
      'sed -i \'s|git@github.com:|https://github.com/|g\' .gitmodules',
      'git submodule update --init --recursive',
      'xcodebuild clean build $ARGS',
      'install -D build/Build/Products/Release/applesimutils {{prefix}}/bin/applesimutils',
    ],
    env: {
      CODE_SIGNING_REQUIRED: 'NO',
      ARGS: [
        '-project applesimutils/applesimutils.xcodeproj',
        '-scheme applesimutils',
        '-configuration Release',
        '-derivedDataPath ./build',
        'BUILD_DIR=../build/Build/Products',
      ],
    },
  },
  test: {
    script: [
      'applesimutils --version | grep {{version}}',
      'applesimutils --help',
    ],
  },
}
