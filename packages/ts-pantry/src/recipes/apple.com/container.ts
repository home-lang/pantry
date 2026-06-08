import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apple.com/container',
  platforms: ['darwin/arm64'],
  name: 'container',
  programs: [
    'container',
    'container-apiserver',
  ],
  distributable: {
    url: 'https://github.com/apple/container/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make $MAKE_ARGS',
      'mkdir -p {{prefix}}',
      'make install $MAKE_ARGS',
    ],
    env: {
      MAKE_ARGS: [
        'DEST_DIR={{prefix}}',
        'SUDO=',
        'BUILD_CONFIGURATION=release',
        'RELEASE_VERSION={{version.tag}}',
      ],
    },
  },
  test: {
    script: [
      'container --version | tee out',
      'grep {{version}} out',
      '(container system status || true) | tee out',
      'grep "apiserver is not running" out',
    ],
  },
}
