import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tukaani.org/xz',
  name: 'xz',
  programs: [
    'lzcat',
    'lzcmp',
    'lzdiff',
    'lzegrep',
    'lzfgrep',
    'lzgrep',
    'lzless',
    'lzma',
    'lzmadec',
    'lzmainfo',
    'lzmore',
    'unlzma',
    'unxz',
    'xz',
    'xzcat',
    'xzcmp',
    'xzdec',
    'xzdiff',
    'xzegrep',
    'xzfgrep',
    'xzgrep',
    'xzless',
    'xzmore',
  ],
  distributable: {
    url: 'https://github.com/tukaani-project/xz/releases/download/v{{version}}/xz-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{ prefix }}',
        '--disable-debug',
        '--disable-doc',
      ],
    },
  },
}
