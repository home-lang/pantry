import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leonerd.org.uk/libvterm',
  name: 'libvterm',
  programs: [
    'unterm',
    'vterm-ctrl',
    'vterm-dump',
  ],
  buildDependencies: {
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://launchpad.net/libvterm/trunk/v{{version.marketing}}/+download/libvterm-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} install PREFIX="{{prefix}}"',
    ],
  },
  test: {
    script: [
      'pkg-config --modversion vterm | grep {{version}}',
    ],
  },
}
