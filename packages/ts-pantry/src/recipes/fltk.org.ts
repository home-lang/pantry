import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fltk.org',
  name: 'fltk',
  description: 'FLTK - Fast Light Tool Kit - https://github.com/fltk/fltk - cross platform GUI development',
  homepage: 'https://www.fltk.org/',
  github: 'https://github.com/fltk/fltk',
  programs: ['fluid', 'fltk-config'],
  versionSource: {
    type: 'github-releases',
    repo: 'fltk/fltk',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/fltk/fltk/releases/download/release-{{version}}/fltk-{{version}}-source.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'run: |',
    ],
  },
}
