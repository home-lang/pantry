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
      // The pkgx `props/` launcher scripts (alpaca.cpp, alpaca.cpp-fetch-model)
      // no longer exist upstream and were never carried into this port, so the
      // `mv props/...` steps aborted the build. Install the built `chat` binary
      // directly as the `alpaca.cpp` program instead.
      'mkdir -p {{prefix}}/bin',
      'make chat',
      'mv chat {{prefix}}/bin/alpaca.cpp',
    ],
  },
}
