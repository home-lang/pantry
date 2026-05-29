import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/giflib.sourceforge.io',
  domain: 'giflib.sourceforge.io',
  name: 'gif',
  description: 'Library and utilities for processing GIFs',
  homepage: 'https://giflib.sourceforge.net/',
  programs: ['gif2rgb', 'gifbuild', 'gifclrmp', 'giffix', 'giftext', 'giftool'],
  distributable: {
    url: 'https://downloads.sourceforge.net/giflib/giflib-{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'imagemagick.org': '*',
  },

  build: {
    script: [
      // the appears to be applied in 5.2.2
      {
        run: [
          'if test {{hw.platform}} = "darwin"; then',
          '  # needed to work on macOS',
          '  patch -p0 < props/Makefile.patch',
          'fi',
        ].join('\n'),
        if: '<5.2.2',
      },
      // 6.1.2: libutil.dylib needs libgif for GifErrorString
      {
        run: [
          'if test {{hw.platform}} = "darwin"; then',
          'sed -i \'s/$(UOBJECTS) -o $(LIBUTILSO)/$(UOBJECTS) libgif.dylib -o $(LIBUTILSO)/\' Makefile',
          'elif test {{hw.platform}} = "linux"; then',
          'sed -i \'s/\\($(CC).*$(UOBJECTS)\\)/\\1 -lgif -L./\' Makefile',
          'fi',
        ].join('\n'),
        if: '^6.1.2',
      },
      'make all',
      'make install PREFIX="{{prefix}}"',
    ],
    env: {
      darwin: {
        // giflib Makefile uses $(CFLAGS) not $(LDFLAGS) for dylib linking
        CFLAGS: '$CFLAGS -Wl,-headerpad_max_install_names',
      },
    },
  },
}
