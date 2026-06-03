import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cilium.io/cilium',
  name: 'cilium',
  programs: [
    'cilium',
  ],
  buildDependencies: {
    'go.dev': '^1.22',
  },
  distributable: {
    url: 'https://github.com/cilium/cilium-cli/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s|github.com/cilium/cilium-cli|github.com/cilium/cilium/cilium-cli|\' Makefile',
        if: '0.16.16',
      },
      {
        run: 'sed -i \'s/^CLI_VERSION=.*/CLI_VERSION=v{{ version }}/\' Makefile',
        if: '>=0.16.17',
      },
      'make install BINDIR={{ prefix }}/bin VERSION=v{{ version }}',
    ],
  },
  test: {
    script: [
      'cilium version | grep {{ version }}',
    ],
  },
}
