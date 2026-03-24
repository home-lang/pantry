import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nodejs.org',
  name: 'node',
  description: 'Platform built on V8 to build network applications',
  homepage: 'https://nodejs.org/',
  github: 'https://github.com/nodejs/node',
  programs: ['node'],
  versionSource: {
    type: 'github-releases',
    repo: 'nodejs/node/tags',
  },
  distributable: {
    url: 'https://nodejs.org/dist/v{{ version }}/node-v{{ version }}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'unicode.org': '^73',
    'openssl.org': '1.1',
    'zlib.net': '1',
  },
  buildDependencies: {
    'python.org': '~3.9',
    'ninja-build.org': '*',
  },

  build: {
    script: [
      'python configure.py $ARGS',
      './configure $ARGS',
      'cd "deps/v8/src/wasm"',
      'sed -i \'/wasm-disassembler.h/a\\',
      '\\',
      '#include <iomanip>\' wasm-disassembler.cc',
      '',
      'export LDFLAGS="$(echo $LDFLAGS | sed \'s/-pie//\')"',
      'cd "deps/v8/src/builtins"',
      'sed -i -f $PROP builtins-typed-array.cc',
      'make --jobs {{ hw.concurrency }} JOBS={{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--ninja', '--with-intl=system-icu', '--without-npm', '--prefix={{ prefix }}', '--shared-openssl', '--shared-zlib'],
    },
  },
}
