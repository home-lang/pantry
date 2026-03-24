import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crystal-lang.org',
  name: 'crystal',
  description: 'Fast and statically typed, compiled language with Ruby-like syntax',
  homepage: 'https://crystal-lang.org/',
  github: 'https://github.com/crystal-lang/crystal',
  programs: ['crystal'],
  versionSource: {
    type: 'github-releases',
    repo: 'crystal-lang/crystal',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/crystal-lang/crystal/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: |',
      'mkdir -p .build',
      'make deps',
      'run: export LDFLAGS="$LDFLAGS -Wl,-ltinfow"',
      'make crystal $ARGS',
      'mkdir -p "{{prefix}}/bin"',
      'cp .build/crystal "{{prefix}}/bin/crystal.bin"',
      'cp props/shim "{{prefix}}/bin/crystal"',
      'cp -a src "{{prefix}}/lib"',
      'run: |',
    ],
  },
}
