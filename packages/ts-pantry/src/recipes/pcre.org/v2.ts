import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pcre.org/v2',
  name: 'pcre2',
  description: 'Perl compatible regular expressions library with a new API',
  homepage: 'https://www.pcre.org/',
  github: 'https://github.com/PCRE2Project/pcre2',
  programs: ['pcre2-config', 'pcre2grep', 'pcre2test'],
  versionSource: {
    type: 'github-tags',
    repo: 'PCRE2Project/pcre2',
    tagPattern: /^pcre2-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/PCRE2Project/pcre2/releases/download/pcre2-{{version.major}}.{{version.minor}}/pcre2-{{version.major}}.{{version.minor}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'sourceware.org/bzip2': '1',
    'zlib.net': '1',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
      {
        run: [
          'sed -i.bak -e \'s/^prefix=.*/prefix=$(dirname $(dirname $0))/\' pcre2-config',
          'rm pcre2-config.bak',
        ].join('\n'),
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-pcre2-16',
        '--enable-pcre2-32',
        '--enable-pcre2grep-libz',
        '--enable-pcre2grep-libbz2',
        '--enable-jit',
      ],
    },
  },
}
