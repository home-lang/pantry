import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ibr.cs.tu-bs.de/libsmi',
  name: 'libsmi',
  programs: [
    'smidiff',
    'smidump',
    'smilint',
    'smiquery',
    'smixlate',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://www.ibr.cs.tu-bs.de/projects/libsmi/download/libsmi-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-debug',
        '--disable-dependency-tracking',
      ],
    },
  },
}
