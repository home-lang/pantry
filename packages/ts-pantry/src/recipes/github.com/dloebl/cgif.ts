import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/dloebl/cgif',
  name: 'cgif',
  programs: [],
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://github.com/dloebl/cgif/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p build',
      'cd build',
      'meson $ARGS',
      'ninja -v',
      'ninja install -v',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '..',
        '-Dtests=false',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion cgif | grep {{version}}',
    ],
  },
}
