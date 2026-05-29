import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fltk.org',
  name: 'fltk',
  description: 'FLTK - Fast Light Tool Kit - https://github.com/fltk/fltk - cross platform GUI development',
  homepage: 'https://www.fltk.org/',
  github: 'https://github.com/fltk/fltk',
  programs: ['fluid', 'fltk-config'],
  versionSource: {
    type: 'github-releases',
    repo: 'fltk/fltk',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/fltk/fltk/releases/download/release-{{version}}/fltk-{{version}}-source.tar.gz',
    stripComponents: 1,
  },

  dependencies: {
    'libjpeg-turbo.org': '^2',
    'libpng.org': '^1',
    linux: {
      'x.org/xft': '^2',
      'x.org/xt': '^1',
      'freedesktop.org/mesa-glu': '^9',
    },
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      // Make fltk-config relocatable (mirror pkgx: rewrite hardcoded prefix to runtime path)
      'cd "{{prefix}}/bin"',
      'sed -i "s|{{prefix}}|\\$(dirname \\$0)/..|g" fltk-config',
      'sed -i "s|{{pkgx.prefix}}|\\$(dirname \\$0)/../../..|g" fltk-config',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-threads',
        '--enable-shared',
      ],
    },
  },
}
