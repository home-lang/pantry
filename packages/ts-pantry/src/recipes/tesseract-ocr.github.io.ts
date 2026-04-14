import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tesseract-ocr.github.io',
  name: 'tesseract',
  description: 'Tesseract Open Source OCR Engine (main repository)',
  homepage: 'https://github.com/tesseract-ocr/',
  github: 'https://github.com/tesseract-ocr/tesseract',
  programs: ['tesseract'],
  versionSource: {
    type: 'github-releases',
    repo: 'tesseract-ocr/tesseract',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/tesseract-ocr/tesseract/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
