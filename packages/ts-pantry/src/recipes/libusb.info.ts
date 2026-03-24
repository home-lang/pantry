import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libusb.info',
  name: 'libusb.info',
  description: 'A cross-platform library to access USB devices ',
  homepage: 'https://libusb.info',
  github: 'https://github.com/libusb/libusb',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'libusb/libusb',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'https://github.com/libusb/libusb/releases/download/v{{ version }}/libusb-{{ version }}.tar.bz2',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"'],
    },
  },
}
