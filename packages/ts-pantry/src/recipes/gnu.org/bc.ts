import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/bc',
  name: 'bc',
  programs: [
    'bc',
    'dc',
  ],
  dependencies: {
    'github.com/westes/flex': '^2.6',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'gnu.org/ed': '*',
    'gnu.org/texinfo': '*',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/bc/bc-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      {
        run: 'sed -i \'s/^\\(\\$(PROGRAMS): \\$(LDADD)\\)$/# \\1/\' Makefile',
        if: '>=1.8',
        'working-directory': 'dc',
      },
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
        '--infodir={{prefix}}/share/info',
        '--mandir={{prefix}}/share/man',
        '--with-libedit',
      ],
    },
  },
  test: {
    script: [
      'bc --version | grep {{version.raw}}',
      'echo \'150+150\' | bc | grep 300',
      'dc --version | grep {{version.raw}}',
      'test "$(dc -f $FIXTURE)" = 300',
    ],
  },
}
