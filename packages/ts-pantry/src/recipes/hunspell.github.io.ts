import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hunspell.github.io',
  name: 'hunspell',
  description: 'Spell checker and morphological analyzer',
  homepage: 'https://hunspell.github.io',
  github: 'https://github.com/hunspell/hunspell',
  programs: ['analyze', 'chmorph', 'hunspell', 'hunzip', 'hzip', 'munch', 'unmunch'],
  versionSource: {
    type: 'github-releases',
    repo: 'hunspell/hunspell',
  },
  distributable: {
    url: 'https://github.com/hunspell/hunspell/releases/download/v{{version}}/hunspell-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/readline': '*',
    'invisible-island.net/ncurses': '*',
    'gnu.org/gettext': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--with-readline', '--with-ui', '--disable-silent-rules'],
    },
  },
}
