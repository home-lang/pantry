import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'littlecms.com',
  name: 'littlecms',
  description: 'A free, open source, CMM engine. It provides fast transforms between ICC profiles.',
  homepage: 'https://www.littlecms.com/',
  github: 'https://github.com/mm2/Little-CMS',
  programs: ['jpgicc', 'linkicc', 'psicc', 'tificc', 'transicc'],
  versionSource: {
    type: 'github-releases',
    repo: 'mm2/Little-CMS/releases/tags',
    tagPattern: /\/^lcms\//,
  },
  distributable: {
    url: 'https://github.com/mm2/Little-CMS/releases/download/lcms{{version.major}}.{{version.minor}}/lcms2-{{version.major}}.{{version.minor}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'simplesystems.org/libtiff': '^4',
    'libjpeg-turbo.org': '^2',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"'],
    },
  },
}
