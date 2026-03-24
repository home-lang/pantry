import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leptonica.org',
  name: 'leptonica',
  description: 'Leptonica is an open source library containing software that is broadly useful for image processing and image analysis applications. The official github repository for Leptonica is: danbloomberg/leptonica.  See leptonica.org for more documentation.',
  homepage: 'http://www.leptonica.org/',
  github: 'https://github.com/DanBloomberg/leptonica',
  programs: ['convertfilestopdf', 'convertfilestops', 'convertformat', 'convertsegfilestopdf', 'convertsegfilestops', 'converttopdf', 'converttops', 'fileinfo', 'imagetops', 'xtractprotos'],
  versionSource: {
    type: 'github-releases',
    repo: 'DanBloomberg/leptonica',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/DanBloomberg/leptonica/releases/download/{{version}}/leptonica-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      'wget https://people.math.sc.edu/Burkardt/data/tif/at3_1m4_01.tif',
      'fileinfo at3_1m4_01.tif',
    ],
  },
}
