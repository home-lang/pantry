import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xt',
  name: 'xt',
  programs: [],
  dependencies: {
    'x.org/ice': '*',
    'x.org/sm': '*',
    'x.org/x11': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXt-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix="{{prefix}}" --sysconfdir="$SHELF"/etc --localstatedir="$SHELF"/var --with-appdefaultdir="$SHELF"/etc/X11/app-defaults',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c',
      './a.out',
    ],
  },
}
