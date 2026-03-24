import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'alacritty.org',
  name: 'alacritty',
  description: 'A cross-platform, OpenGL terminal emulator.',
  homepage: 'https://alacritty.org',
  github: 'https://github.com/alacritty/alacritty',
  programs: ['alacritty'],
  versionSource: {
    type: 'github-releases',
    repo: 'alacritty/alacritty',
  },
  distributable: {
    url: 'https://github.com/alacritty/alacritty/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.75',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      'ARGS': ['--locked', '--path=alacritty', '--root {{prefix}}'],
    },
  },
}
