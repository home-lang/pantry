import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'liblqr.wikidot.com',
  name: 'liblqr.wikidot',
  description: 'Liquid Rescale library',
  github: 'https://github.com/carlobaldassi/liblqr',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'carlobaldassi/liblqr',
  },
  distributable: {
    url: 'https://github.com/carlobaldassi/liblqr/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/glib': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--enable-install-man'],
    },
  },
}
