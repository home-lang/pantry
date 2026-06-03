import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libimobiledevice.org/libimobiledevice-glue',
  name: 'libimobiledevice-glue',
  programs: [],
  dependencies: {
    'libimobiledevice.org/libplist': '^2.4',
  },
  buildDependencies: {
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://github.com/libimobiledevice/libimobiledevice-glue/releases/download/{{version.tag}}/libimobiledevice-glue-{{version.tag}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'test "$(pkg-config --modversion libimobiledevice-glue-1.0)" = \'{{version.tag}}\'',
    ],
  },
}
