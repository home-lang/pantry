import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jpsim/SourceKitten',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'SourceKitten',
  programs: [
    'sourcekitten',
  ],
  distributable: {
    url: 'git+https://github.com/jpsim/SourceKitten.git',
  },
  build: {
    script: [
      {
        run: 'patch -p1 < props/patch.diff',
        if: '<0.34.2',
      },
      'make prefix_install PREFIX={{prefix}} TEMPORARY_FOLDER=$PWD/SourceKitten.dst --jobs={{hw.concurrency}}',
    ],
  },
  test: {
    script: [
      'exit 0',
      'sourcekitten version | grep {{version}}',
      'sourcekitten syntax --text "import Foundation"',
    ],
  },
}
