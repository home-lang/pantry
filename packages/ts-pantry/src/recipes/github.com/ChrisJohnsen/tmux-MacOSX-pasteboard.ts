import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ChrisJohnsen/tmux-MacOSX-pasteboard',
  name: 'tmux-MacOSX-pasteboard',
  programs: [
    'reattach-to-user-namespace',
  ],
  buildDependencies: {
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/ChrisJohnsen/tmux-MacOSX-pasteboard/archive/refs/tags/v{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make',
      'mkdir -p {{ prefix }}/bin',
      'mv reattach-to-user-namespace {{ prefix }}/bin',
    ],
  },
  test: {
    script: [
      'reattach-to-user-namespace -l bash -c "echo Hello World!"',
    ],
  },
}
