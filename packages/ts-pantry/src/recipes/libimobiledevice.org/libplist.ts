import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libimobiledevice.org/libplist',
  name: 'libplist',
  programs: [
    'plistutil',
  ],
  distributable: {
    url: 'https://github.com/libimobiledevice/libplist/releases/download/{{version}}/libplist-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make',
      'make install',
      {
        run: 'sed -i \'s/\\+brewing//g\' *.la pkgconfig/*.pc',
      },
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--disable-silent-rules',
        '--without-cython',
      ],
    },
  },
  test: {
    script: [
      'plistutil -i $FIXTURE -o test_binary.plist',
      'ls | grep test_binary.plist',
      'plistutil --version | grep {{version}}',
    ],
  },
}
