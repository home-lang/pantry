import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
  // Upstream ships official prebuilt Linux binaries (amd64/arm64) for every
  // release. macOS has no official prebuilt, so darwin still compiles from
  // the source tarball.
  distributable: {
    url: 'https://github.com/upx/upx/releases/download/{{version.tag}}/upx-{{version}}-src.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    darwin: {
      'cmake.org': '*',
    },
  },

  build: {
    script: [
      'if [ "{{hw.platform}}" = "linux" ]; then',
      '  case {{hw.arch}} in',
      '    aarch64) ARCH="arm64" ;;',
      '    x86-64)  ARCH="amd64" ;;',
      '  esac',
      '  URL="https://github.com/upx/upx/releases/download/{{version.tag}}/upx-{{version}}-${ARCH}_linux.tar.xz"',
      '  curl -Lfo upx.tar.xz "$URL"',
      '  tar Jxf upx.tar.xz',
      '  install -Dm755 "upx-{{version}}-${ARCH}_linux/upx" {{prefix}}/bin/upx',
      'else',
      '  cmake -S . -B build $CMAKE_ARGS',
      '  cmake --build build',
      '  cmake --install build',
      'fi',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-Wno-dev'],
    },
  },
}
