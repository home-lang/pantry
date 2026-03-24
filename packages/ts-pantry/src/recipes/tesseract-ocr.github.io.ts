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
      'make --jobs {{ hw.concurrency }}',
      'make install',
      'run:',
      'wget https://raw.githubusercontent.com/tesseract-ocr/test/6dd816cdaf3e76153271daf773e562e24c928bf5/testing/eurotext.tif',
      'tesseract eurotext.tif stdout -l eng',
    ],
  },
}
