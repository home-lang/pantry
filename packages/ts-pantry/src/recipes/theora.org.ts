import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'theora.org',
  name: 'theora',
  programs: [],
  distributable: {
    url: 'http://downloads.xiph.org/releases/theora/libtheora-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'xiph.org/ogg': '*',
    'xiph.org/vorbis': '*',
  },
  buildDependencies: {
    'gnu.org/libtool': '*',
    'gnu.org/automake': '*',
    'gnu.org/autoconf': '>=2.71',
    'freedesktop.org/pkg-config': '*',
    'gnu.org/wget': '*',
  },

  build: {
    script: [
      'wget -O config.guess \'https://git.savannah.gnu.org/gitweb/?p=config.git;a=blob_plain;f=config.guess;hb=HEAD\'',
      'wget -O config.sub \'https://git.savannah.gnu.org/gitweb/?p=config.git;a=blob_plain;f=config.sub;hb=HEAD\'',
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-dependency-tracking', '--disable-oggtest', '--disable-vorbistest', '--disable-examples'],
    },
  },
}
