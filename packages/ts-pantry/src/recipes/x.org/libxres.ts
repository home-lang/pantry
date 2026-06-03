import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libxres',
  name: 'libxres',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/exts': '*',
    'x.org/protocol': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXres-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix="{{prefix}}" --sysconfdir="{{prefix}}"/etc --localstatedir="{{prefix}}"/var --enable-spec=no',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'cc $FIXTURE',
      './a.out',
    ],
  },
}
