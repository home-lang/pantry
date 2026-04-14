import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ijg.org',
  name: 'ijg',
  programs: ['cjpeg', 'djpeg', 'jpegtran', 'rdjpgcom', 'wrjpgcom'],
  distributable: {
    url: 'https://ijg.org/files/jpegsrc.v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cp props/config.guess props/config.sub .',
      './configure --disable-dependency-tracking --disable-silent-rules --prefix="{{prefix}}"',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
