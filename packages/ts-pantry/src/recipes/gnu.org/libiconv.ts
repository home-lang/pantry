import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libiconv',
  name: 'iconv',
  description: 'GNU charset conversion library and iconv program',
  homepage: 'https://www.gnu.org/software/libiconv/',
  programs: ['iconv'],
  // pkgx: linux needs libstdcxx at runtime.
  dependencies: {
    linux: {
      'gnu.org/gcc/libstdcxx': '14',
    },
  },
  versionSource: {
    type: 'url-pattern',
    // Tarballs are published with the marketing (major.minor) version.
    url: 'https://ftp.gnu.org/gnu/libiconv/libiconv-{{version.marketing}}.tar.gz',
    knownVersions: ['1.17.0', '1.18.0', '1.19.0'],
  },
  distributable: {
    // pkgx ships libiconv-{{version.marketing}}.tar.gz (e.g. 1.19, not 1.19.0).
    url: 'https://ftp.gnu.org/gnu/libiconv/libiconv-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-dependency-tracking',
        '--enable-extra-encodings',
        '--enable-static',
      ],
    },
  },

  test: {
    script: [
      'OUT=$(echo hello | iconv -f UTF-8 -t UTF-8)',
      'test "$OUT" = "hello"',
    ],
  },
}
