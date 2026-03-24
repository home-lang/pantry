import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rioterm.com',
  name: 'rio',
  description: 'A hardware-accelerated GPU terminal emulator focusing to run in desktops and browsers.',
  homepage: 'https://rioterm.com',
  github: 'https://github.com/raphamorim/rio',
  programs: ['rio'],
  versionSource: {
    type: 'github-releases',
    repo: 'raphamorim/rio',
  },
  distributable: {
    url: 'https://github.com/raphamorim/rio/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.85',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
