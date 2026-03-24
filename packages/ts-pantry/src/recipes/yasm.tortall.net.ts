import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'yasm.tortall.net',
  name: 'yasm',
  description: 'Yasm Assembler mainline development tree',
  homepage: 'https://yasm.tortall.net/',
  github: 'https://github.com/yasm/yasm',
  programs: ['yasm'],
  versionSource: {
    type: 'github-releases',
    repo: 'yasm/yasm',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://www.tortall.net/projects/yasm/releases/yasm-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-python', '--disable-debug'],
    },
  },
}
