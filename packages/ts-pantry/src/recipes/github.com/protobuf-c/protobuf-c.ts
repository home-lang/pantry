import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/protobuf-c/protobuf-c',
  name: 'protobuf-c',
  programs: [
    'protoc-c',
    'protoc-gen-c',
  ],
  dependencies: {
    'protobuf.dev': '^25.1',
    'abseil.io': '^20250127',
  },
  distributable: {
    url: 'https://github.com/protobuf-c/protobuf-c/releases/download/v{{version}}/protobuf-c-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CFLAGS: '$CFLAGS -DNDEBUG',
      CONFIGURE_ARGS: [
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'protoc-c test.proto --c_out=.',
      'ls | grep test.pb-c.c',
      'protoc-c --version | grep {{version}}',
    ],
  },
}
