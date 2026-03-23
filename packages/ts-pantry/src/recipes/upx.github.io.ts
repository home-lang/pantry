import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'upx.github.io',
  name: 'upx',
  description: 'UPX - the Ultimate Packer for eXecutables',
  homepage: 'https://upx.github.io/',
  github: 'https://github.com/upx/upx',
  programs: ['upx'],
  versionSource: {
    type: 'github-releases',
    repo: 'upx/upx',
  },
  distributable: {
    url: 'https://github.com/upx/upx/releases/download/{{version.tag}}/upx-{{version}}-src.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-Wno-dev'],
    },
  },
}
