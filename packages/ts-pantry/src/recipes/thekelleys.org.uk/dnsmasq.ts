import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'thekelleys.org.uk/dnsmasq',
  name: 'dnsmasq',
  programs: [
    'dnsmasq',
  ],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://thekelleys.org.uk/dnsmasq/dnsmasq-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make install PREFIX={{ prefix }}',
    ],
  },
}
