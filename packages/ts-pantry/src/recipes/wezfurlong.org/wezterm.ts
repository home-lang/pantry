import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wezfurlong.org/wezterm',
  name: 'wezterm',
  programs: [
    'wezterm',
  ],
  dependencies: {
    'zlib.net': '^1.3',
    linux: {
      'freetype.org': '*',
      'freedesktop.org/fontconfig': '*',
      'openssl.org': '^1.1',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.71<1.78',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/wez/wezterm/releases/download/{{version.tag}}/wezterm-{{version.tag}}-src.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      ARGS: [
        '--locked',
        '--path=wezterm',
        '--root {{prefix}}',
      ],
    },
  },
}
