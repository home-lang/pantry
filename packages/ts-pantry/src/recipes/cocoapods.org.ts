import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cocoapods.org',
  name: 'pod',
  description: 'Dependency manager for Cocoa projects',
  homepage: 'https://cocoapods.org/',
  github: 'https://github.com/CocoaPods/CocoaPods',
  programs: ['pod'],
  versionSource: {
    type: 'github-releases',
    repo: 'CocoaPods/CocoaPods',
  },
  distributable: {
    url: 'https://github.com/CocoaPods/CocoaPods/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'ruby-lang.org': '~3.2',
    'sourceware.org/libffi': '^3',
    'rubygems.org': '^3',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'gem build cocoapods.gemspec',
      'gem install cocoapods-{{version}}.gem',
      'cd "${{prefix}}/gems/bin"',
      'mv {{prefix}}/bin/* .',
      'cp $SRCROOT/props/proxy {{prefix}}/bin/pod',
    ],
    env: {
      'GEM_HOME': '${{prefix}}',
      'GEM_PATH': '${{prefix}}',
      'CFLAGS': '-I{{deps.sourceware.org/libffi.prefix}}/include',
    },
  },
}
