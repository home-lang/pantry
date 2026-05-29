import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lame.sourceforge.io',
  name: 'lame',
  description: 'High quality MPEG Audio Layer III (MP3) encoder',
  homepage: 'https://lame.sourceforge.io/',
  programs: ['lame'],
  distributable: {
    // The release tarball is published as lame-{major}.{minor} (e.g. 3.100), but
    // the discovered version is normalized to 3.100.0, so version.raw 404s. Use
    // version.marketing (major.minor) to match the upstream filename.
    url: 'https://downloads.sourceforge.net/project/lame/lame/{{version.marketing}}/lame-{{version.marketing}}.tar.gz',
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
    env: {
      'linux/x86-64': {
        CFLAGS: '-fPIC',
        CXXFLAGS: '-fPIC',
        LDFLAGS: '-pie',
      },
    },
  },
}
