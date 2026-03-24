import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ruby-lang.org',
  name: 'ruby-lang',
  description: 'Powerful, clean, object-oriented scripting language',
  homepage: 'https://www.ruby-lang.org/',
  github: 'https://github.com/ruby/ruby',
  programs: [],
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
      'run:',
      'run:',
      'run:',
      'make install',
      'run: rm -f bundle bundler gem',
      'fix-shebangs.ts ${{prefix}}/bin/*',
      'working-directory: ${{prefix}}/lib/ruby/{{version.marketing}}.0',
      'run:',
      'run:',
      'run: |',
      'run:',
      'run: sed -i',
      'ruby -e \\puts "Hello World!"\\',
      'run: ruby $FIXTURE',
      'run: ruby $FIXTURE',
      'run: ruby --yjit $FIXTURE',
    ],
  },
}
