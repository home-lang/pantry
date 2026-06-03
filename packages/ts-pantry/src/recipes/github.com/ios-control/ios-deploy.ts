import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ios-control/ios-deploy',
  name: 'ios-deploy',
  programs: [
    'ios-deploy',
  ],
  distributable: {
    url: 'git+https://github.com/ios-control/ios-deploy.git',
  },
  build: {
    script: [
      'xcodebuild -configuration Release SYMROOT=build -arch $(uname -m)',
      'xcodebuild test -scheme ios-deploy-tests -configuration Release SYMROOT=build -arch $(uname -m)',
      'install -D build/Release/ios-deploy {{prefix}}/bin/ios-deploy',
    ],
  },
}
