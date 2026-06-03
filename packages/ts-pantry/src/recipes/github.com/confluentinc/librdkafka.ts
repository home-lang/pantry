import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/confluentinc/librdkafka',
  name: 'librdkafka',
  programs: [],
  dependencies: {
    'lz4.org': '*',
    'zlib.net': '*',
    'openssl.org': '^1.1',
    'facebook.com/zstd': '*',
    'curl.se': '*',
  },
  buildDependencies: {
    'python.org': '~3.11',
    linux: {
      'llvm.org': '*',
    },
  },
  distributable: {
    url: 'https://github.com/confluentinc/librdkafka/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      linux: {
        LDFLAGS: '$LDFLAGS -Wl,--undefined-version',
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
        AR: 'llvm-ar',
        AS: 'llvm-as',
      },
    },
  },
  test: {
    script: [
      'pkg-config --modversion rdkafka | grep {{version}}',
    ],
  },
}
