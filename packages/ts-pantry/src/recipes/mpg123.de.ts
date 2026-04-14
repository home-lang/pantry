import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mpg123.de',
  name: 'mpg123',
  description: 'MP3 player for Linux and UNIX',
  homepage: 'https://www.mpg123.de/',
  programs: ['mpg123'],
  distributable: {
    url: 'https://www.mpg123.de/download/mpg123-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--with-module-suffix=.so', '--enable-static'],
    },
  },
}
