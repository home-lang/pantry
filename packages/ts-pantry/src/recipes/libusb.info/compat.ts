import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libusb.info/compat',
  name: 'compat',
  programs: [
    'libusb-config',
  ],
  dependencies: {
    'libusb.info': '^1',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'linux/aarch64': {
      'systemd.io': '*',
    },
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/libusb/libusb-compat-{{version.marketing}}/libusb-compat-{{version}}/libusb-compat-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      {
        run: 'sed -i \'s|{{prefix}}|$(dirname $0)/..|g\' libusb-config',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'libusb-config --libs | grep {{prefix}}',
      'cc test.c -o test -lusb',
      './test',
    ],
  },
}
