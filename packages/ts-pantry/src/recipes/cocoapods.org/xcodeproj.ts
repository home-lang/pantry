import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "cocoapods.org/xcodeproj",
  name: "xcodeproj",
  programs: [
    "xcodeproj",
  ],
  dependencies: {
    'ruby-lang.org': "~3.2",
    'rubygems.org': "^3",
  },
  distributable: {
    url: "https://github.com/CocoaPods/Xcodeproj/archive/refs/tags/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "gem build xcodeproj.gemspec",
      "gem install --no-user-install --bindir={{prefix}}/gems/bin --no-document xcodeproj-{{version}}.gem",
      {
        run: "cp $SRCROOT/props/xcodeproj .\nchmod +x xcodeproj",
        'working-directory': "{{prefix}}/bin",
      },
    ],
    env: {
      GEM_HOME: "${{prefix}}",
      GEM_PATH: "${{prefix}}",
    },
  },
}
