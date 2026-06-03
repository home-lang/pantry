import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/cppunit',
  name: 'cppunit',
  programs: [
    'cppunit-config',
    'DllPlugInTester',
  ],
  distributable: {
    url: 'http://dev-www.libreoffice.org/src/cppunit-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
      ],
      'linux/aarch64': {
        ARGS: [
          '--build=aarch64-unknown-linux-gnu',
        ],
      },
    },
  },
}
