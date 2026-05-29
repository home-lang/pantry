import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/ijg.org',
  domain: 'ijg.org',
  name: 'ijg',
  programs: ['cjpeg', 'djpeg', 'jpegtran', 'rdjpgcom', 'wrjpgcom'],
  distributable: {
    url: 'https://ijg.org/files/jpegsrc.v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // config.guess from 2011 doesn't recognize aarch64
      { run: 'cp props/config.guess props/config.sub .', if: '^8' },
      './configure --disable-dependency-tracking --disable-silent-rules --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
