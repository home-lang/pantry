import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xtrans',
  name: 'xtrans',
  programs: [],
  dependencies: {
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'x.org/util-macros': '*',
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/xtrans-{{ version.raw }}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      '# otherwise X11 fails to build on all platforms we support at least lol',
      'sed -i.bak \'s|# include <sys/stropts.h>|# include <sys/ioctl.h>|g\' Xtranslcl.c',
      './configure \\',
      '  --prefix="{{prefix}}" \\',
      '  --sysconfdir="$SHELF"/etc \\',
      '  --localstatedir="$SHELF"/var \\',
      '  --disable-debug \\',
      '  --enable-docs=no',
      'make',
      'make install',
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
