import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lame.sourceforge.io',
  name: 'lame',
  description: 'High quality MPEG Audio Layer III (MP3) encoder',
  homepage: 'https://lame.sourceforge.io/',
  programs: ['lame'],
  distributable: {
    url: 'https://prdownloads.sourceforge.net/project/lame/lame/{{version.raw}}/lame-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      '# Fix for Undefined symbols ... "_lame_init_old"',
      '# https://sourceforge.net/p/lame/mailman/message/36081038/',
      'sed -i.bak "/lame_init_old/d" include/libmp3lame.sym',
      '',
      './configure --prefix={{prefix}} \\',
      '            --disable-debug \\',
      '            --disable-dependency-tracking \\',
      '            --enable-nasm',
      'make install',
      '',
    ],
  },
}
