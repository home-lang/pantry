import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fossies.org/libelf',
  name: 'libelf',
  programs: [],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
  },
  distributable: {
    url: 'https://www.mirrorservice.org/sites/ftp.netbsd.org/pub/pkgsrc/distfiles/libelf-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cp props/config.guess props/config.sub .',
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      CFLAGS: '-Wno-implicit-function-declaration',
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-compat',
      ],
    },
  },
  test: {
    script: [
      'xxd -r -p $FIXTURE elf',
      'cc $FIXTURE -lelf -o test',
      './test | tee out',
      'grep "32-bit ELF" out',
    ],
  },
}
