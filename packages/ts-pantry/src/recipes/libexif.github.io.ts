import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libexif.github.io',
  name: 'libexif.github',
  description: 'A library for parsing, editing, and saving EXIF data',
  github: 'https://github.com/libexif/libexif',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'libexif/libexif',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/libexif/libexif/releases/download/v{{version}}/libexif-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/gettext': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} ',
      'make install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-dependency-tracking'],
    },
  },
}
