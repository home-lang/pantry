import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libarchive.org',
  name: 'libarchive',
  description: 'Multi-format archive and compression library',
  homepage: 'https://www.libarchive.org',
  github: 'https://github.com/libarchive/libarchive',
  programs: ['bsdcat', 'bsdcpio', 'bsdtar'],
  versionSource: {
    type: 'github-releases',
    repo: 'libarchive/libarchive',
    tagPattern: /^Libarchive (.+)$/,
  },
  distributable: {
    url: 'https://github.com/libarchive/libarchive/releases/download/v{{version}}/libarchive-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/coreutils': '*',
    'lz4.org': '1',
    'tukaani.org/xz': '5',
    'facebook.com/zstd': '1',
    'sourceware.org/bzip2': '1',
    'libexpat.github.io': '2',
    'zlib.net': '1',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      'cd "{{prefix}}/lib/pkgconfig"',
      'perl -ni -e \'print unless /Requires\\.private:.*iconv/\' libarchive.pc',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--without-lzo2', '--without-nettle', '--without-xml2', '--without-openssl', '--with-expat'],
    },
  },
}
