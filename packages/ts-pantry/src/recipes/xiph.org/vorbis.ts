import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xiph.org/vorbis',
  name: 'vorbis',
  programs: [],
  dependencies: {
    'xiph.org/ogg': '^1',
  },
  distributable: {
    url: 'https://downloads.xiph.org/releases/vorbis/libvorbis-1.3.7.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE b.c',
      'cc b.c -lvorbisfile',
    ],
  },
}
