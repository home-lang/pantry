import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'fastlane.tools',
  name: 'fastlane',
  description: '🚀 The easiest way to automate building and releasing your iOS and Android apps',
  homepage: 'https://fastlane.tools',
  github: 'https://github.com/fastlane/fastlane',
  programs: ['fastlane'],
  versionSource: {
    type: 'github-releases',
    repo: 'fastlane/fastlane/releases/tags',
  },
  distributable: {
    url: 'https://github.com/fastlane/fastlane/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'ruby-lang.org': '~3.2',
    'rubygems.org': '*',
  },

  build: {
    script: [
      'gem build fastlane.gemspec',
      'gem install --no-user-install --bindir={{prefix}}/gems/bin --no-document fastlane-{{version}}.gem',
      'cd "{{prefix}}/bin"',
      'cp $SRCROOT/props/fastlane .',
      'rm -rf "{{prefix}}"/gems/terminal-notifier-*',
    ],
    env: {
      'GEM_HOME': '${{prefix}}',
      'GEM_PATH': '${{prefix}}',
    },
  },
}
