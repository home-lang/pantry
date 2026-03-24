import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sniffnet.net',
  name: 'sniffnet',
  description: 'Cross-platform application to monitor your network traffic',
  homepage: 'https://sniffnet.net',
  github: 'https://github.com/GyulyVGC/sniffnet',
  programs: ['sniffnet'],
  versionSource: {
    type: 'github-releases',
    repo: 'GyulyVGC/sniffnet',
  },
  distributable: {
    url: 'https://github.com/GyulyVGC/sniffnet/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '1',
    'tcpdump.org': '1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.78',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
