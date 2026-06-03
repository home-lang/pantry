import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/antimatter15/alpaca.cpp',
  name: 'alpaca',
  programs: [
    'alpaca.cpp',
  ],
  buildDependencies: {
    'freedesktop.org/pkg-config': '~0.29',
    'gnu.org/wget': '*',
  },
  distributable: {
    url: 'https://github.com/antimatter15/alpaca.cpp/archive/refs/tags/81bd894.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin {{prefix}}/tbin {{prefix}}/share',
      'make chat',
      'mv chat {{prefix}}/tbin/alpaca.cpp',
      'mv props/alpaca.cpp {{prefix}}/bin',
      'mv props/alpaca.cpp-fetch-model {{prefix}}/tbin',
    ],
  },
}
