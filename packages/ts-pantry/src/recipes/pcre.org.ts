import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pcre.org',
  name: 'pcre',
  description: 'Perl compatible regular expressions library',
  homepage: 'https://www.pcre.org/',
  programs: ['pcre-config', 'pcregrep', 'pcretest'],
  distributable: {
    url: 'https://ftp.exim.org/pub/pcre/pcre-{{version.marketing}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'sourceware.org/bzip2': '1',
    'zlib.net': '1',
  },

  build: {
    script: [
      './configure \\',
      '  --prefix={{prefix}} \\',
      '  --enable-pcre16 \\',
      '  --enable-pcre32 \\',
      '  --enable-utf \\',
      '  --enable-unicode-properties \\',
      '  --enable-pcregrep-libz \\',
      '  --enable-pcregrep-libbz2 \\',
      '  --enable-jit',
      'make --jobs {{hw.concurrency}}',
      'make install',
      '',
    ],
  },
}
