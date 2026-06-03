import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/pkg-config',
  name: 'pkg-config',
  programs: [
    'pkg-config',
  ],
  distributable: {
    url: 'https://pkgconfig.freedesktop.org/releases/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }} --disable-debug --disable-host-tool --with-internal-glib --with-pc-path=/usr/lib/pkgconfig:/usr/share/pkgconfig',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CFLAGS: '-Wno-error=int-conversion $CFLAGS',
    },
  },
}
