import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'giflib.sourceforge.io',
  name: 'gif',
  description: 'Library and utilities for processing GIFs',
  homepage: 'https://giflib.sourceforge.net/',
  programs: ['gif2rgb', 'gifbuild', 'gifclrmp', 'giffix', 'giftext', 'giftool'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/giflib/giflib-{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'imagemagick.org': '*',
  },

  build: {
    script: [
      'if test {{hw.platform}} = "darwin"; then',
      '  # needed to work on macOS',
      '  patch -p0 < props/Makefile.patch',
      'fi',
      '',
      'make --jobs {{hw.concurrency}} all',
      'make install PREFIX="{{prefix}}"',
    ],
  },
}
