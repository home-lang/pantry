import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ruby-lang.org',
  name: 'ruby-lang',
  description: 'Powerful, clean, object-oriented scripting language',
  homepage: 'https://www.ruby-lang.org/',
  github: 'https://github.com/ruby/ruby',
  programs: ['erb', 'irb', 'rake', 'rdoc', 'ri', 'ruby'],
  versionSource: {
    type: 'github-releases',
    repo: 'ruby/ruby',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://cache.ruby-lang.org/pub/ruby/{{version.marketing}}/ruby-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'patch -p1 -F5 < props/mkconfig.rb.diff',
      'CC=cc CXX=c++ ./configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
