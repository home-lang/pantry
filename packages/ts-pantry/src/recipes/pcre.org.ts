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
      '  --prefix={{ prefix }} \\',
      '  --enable-pcre2-16 \\',
      '  --enable-pcre2-32 \\',
      '  --enable-pcre2grep-libz \\',
      '  --enable-pcre2grep-libbz2 \\',
      '  --enable-jit',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      '',
    ],
  },
}
