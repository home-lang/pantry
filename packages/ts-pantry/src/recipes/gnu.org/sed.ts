import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/sed',
  name: 'sed',
  description: 'GNU implementation of the famous stream editor',
  homepage: 'https://www.gnu.org/software/sed/',
  programs: ['sed'],
  versionSource: {
    type: 'url-pattern',
    url: 'https://ftp.gnu.org/gnu/sed/sed-{{version}}.tar.gz',
    knownVersions: ['4.10', '4.9', '4.8'],
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/sed/sed-{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
      ],
    },
  },

  test: {
    script: [
      'echo "Hello world!" > fixture.txt',
      'sed -i \'s/world/World/g\' fixture.txt',
      'test "$(cat fixture.txt)" = "Hello World!"',
    ],
  },
}
