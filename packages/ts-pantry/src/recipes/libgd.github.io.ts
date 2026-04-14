import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libgd.github.io',
  name: 'libgd.github',
  description: 'Graphics library to dynamically manipulate images',
  homepage: 'https://libgd.github.io/',
  github: 'https://github.com/libgd/libgd',
  programs: ['bdftogd', 'gd2copypal', 'gd2togif', 'gdcmpgif', 'giftogd2'],
  versionSource: {
    type: 'github-releases',
    repo: 'libgd/libgd',
    tagPattern: /^gd-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/libgd/libgd/releases/download/gd-{{version}}/libgd-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'freedesktop.org/fontconfig': '*',
    'freetype.org': '*',
    'libjpeg-turbo.org': '*',
    'github.com/AOMediaCodec/libavif': '*',
    'libpng.org': '*',
    'simplesystems.org/libtiff': '*',
    'google.com/webp': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--disable-dependency-tracking', '--prefix="{{prefix}}"', '--with-zlib'],
    },
  },
}
