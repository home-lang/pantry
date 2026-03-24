import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'speex.org',
  name: 'speexdec',
  description: 'Audio codec designed for speech',
  homepage: 'https://speex.org/',
  programs: ['speexdec'],
  distributable: {
    url: 'https://downloads.xiph.org/releases/speex/speex-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'xiph.org/ogg': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"'],
    },
  },
}
