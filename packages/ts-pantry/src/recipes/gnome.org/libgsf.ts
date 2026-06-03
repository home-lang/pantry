import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/libgsf',
  name: 'libgsf',
  programs: [
    'gsf',
    'gsf-office-thumbnailer',
    'gsf-vba-dump',
  ],
  dependencies: {
    'gnome.org/glib': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/libgsf/{{version.marketing}}/libgsf-{{version}}.tar.xz',
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
        '--disable-silent-rules',
      ],
    },
  },
}
