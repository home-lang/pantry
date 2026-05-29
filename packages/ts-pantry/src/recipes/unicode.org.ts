import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'unicode.org',
  name: 'unicode',
  description: 'The home of the ICU project source code.',
  homepage: 'https://icu.unicode.org/',
  github: 'https://github.com/unicode-org/icu',
  programs: ['derb', 'genbrk', 'gencfu', 'gencnval', 'gendict', 'genrb', 'icu-config', 'icuexportdata', 'icuinfo', 'makeconv', 'pkgdata', 'uconv'],
  versionSource: {
    type: 'github-releases',
    repo: 'unicode-org/icu',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/unicode-org/icu/releases/download/{{version.tag}}/icu4c-{{version.major}}.{{version.minor}}-sources.tgz',
    stripComponents: 1,
  },

  buildDependencies: {
    'curl.se': '*',
    darwin: {
      // xcode gets touchy about combining c and c++:
      // error: invalid argument '-std=c11' not allowed with 'C++'
      'llvm.org': '20', // since 78.1
    },
  },

  build: {
    workingDirectory: 'source',
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-samples',
        '--disable-tests',
        '--enable-static',
        '--with-library-bits=64',
      ],
      darwin: {
        // changing install names or rpaths can't be redone for
        LDFLAGS: '-headerpad_max_install_names',
      },
    },
    script: [
      // v74.1 replaced LICENSE with a broken symlink
      {
        run: [
          'rm ../LICENSE',
          'curl -L https://raw.githubusercontent.com/unicode-org/icu/main/LICENSE -o ../LICENSE',
        ],
        if: '>=74.1',
      },
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
