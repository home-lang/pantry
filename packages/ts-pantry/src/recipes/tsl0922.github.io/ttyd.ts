import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tsl0922.github.io/ttyd',
  name: 'ttyd',
  programs: [
    'ttyd',
  ],
  dependencies: {
    'libuv.org': '1',
    'github.com/json-c/json-c': '^0.16',
    'libwebsockets.org': '~4.3',
    'zlib.net': '1',
  },
  buildDependencies: {
    'cmake.org': '3',
  },
  distributable: {
    url: 'https://github.com/tsl0922/ttyd/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX="{{prefix}}"',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
