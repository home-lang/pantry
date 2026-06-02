import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/webp',
  name: 'webp',
  description: 'WebP image format encoder/decoder tools and library (libwebp).',
  homepage: 'https://developers.google.com/speed/webp/',
  github: 'https://github.com/webmproject/libwebp',
  programs: ['cwebp', 'dwebp', 'gif2webp', 'img2webp', 'vwebp', 'webpinfo', 'webpmux'],
  dependencies: {
    'giflib.sourceforge.io': '^5',
    'libjpeg-turbo.org': '^2',
    'libpng.org': '^1',
    'simplesystems.org/libtiff': '^4',
  },
  versionSource: {
    type: 'github-tags',
    repo: 'webmproject/libwebp',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}}',
      'make install',
      {
        run: 'rm *.la',
        'working-directory': '{{prefix}}/lib',
      },
    ],
  },
}
