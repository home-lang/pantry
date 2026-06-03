import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'savannah.nongnu.org/attr',
  name: 'attr',
  programs: [
    'attr',
    'getfattr',
    'setfattr',
  ],
  buildDependencies: {
    'gnu.org/gettext': '*',
  },
  distributable: {
    url: 'https://download.savannah.nongnu.org/releases/attr/attr-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
      ],
    },
  },
  test: {
    script: [
      'echo "Hello World!\\n" > test.txt',
      'setfattr -n user.test -v "Hello World!" test.txt',
      'getfattr -d test.txt | grep \'Hello World!\'',
      'getfattr -n user.test test.txt | grep \'Hello World!\'',
      'getfattr -n user.test -e hex test.txt | grep \'0x48656c6c6f20576f726c6421\'',
      'attr -l test.txt',
    ],
  },
}
