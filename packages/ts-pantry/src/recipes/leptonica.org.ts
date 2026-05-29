import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leptonica.org',
  name: 'leptonica',
  description: 'Leptonica is an open source library containing software that is broadly useful for image processing and image analysis applications. The official github repository for Leptonica is: danbloomberg/leptonica.  See leptonica.org for more documentation.',
  homepage: 'https://www.leptonica.org/',
  github: 'https://github.com/DanBloomberg/leptonica',
  programs: ['convertfilestopdf', 'convertfilestops', 'convertformat', 'convertsegfilestopdf', 'convertsegfilestops', 'converttopdf', 'converttops', 'fileinfo', 'imagetops', 'xtractprotos'],
  versionSource: {
    type: 'github-releases',
    repo: 'DanBloomberg/leptonica',
    tagPattern: /^v(.+)$/,
  },
  dependencies: {
    'giflib.sourceforge.io': '5',
    'libjpeg-turbo.org': '2',
    'libpng.org': '1',
    'simplesystems.org/libtiff': '4',
    'openjpeg.org': '*',
    'google.com/webp': '*',
  },
  distributable: {
    url: 'https://github.com/DanBloomberg/leptonica/releases/download/{{version}}/leptonica-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
    },
  },
}
