import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceware.org/dm',
  name: 'dm',
  programs: [],
  dependencies: {
    'pagure.io/libaio': '^0.3',
  },
  distributable: {
    url: 'https://gitlab.com/lvmteam/lvm2/-/archive/{{version.tag}}/lvm2-{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'TMP_PREFIX=$(mktemp -d)',
      './configure $ARGS --prefix="$TMP_PREFIX"',
      'make device-mapper',
      'make install_device-mapper',
      'mkdir -p "{{prefix}}"',
      'cp -a "$TMP_PREFIX"/* "{{prefix}}"',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--enable-pkgconfig',
      ],
      linux: {
        CFLAGS: '$CFLAGS -Wl,--undefined-version',
        CC: 'clang',
        LD: 'clang',
      },
    },
  },
  test: {
    script: [
      'cc $FIXTURE -ldevmapper -o test && ./test',
    ],
  },
}
