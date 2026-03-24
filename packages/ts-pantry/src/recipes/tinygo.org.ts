import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tinygo.org',
  name: 'tinygo',
  description: 'Go compiler for small places. Microcontrollers, WebAssembly (WASM/WASI), and command-line tools. Based on LLVM.',
  homepage: 'https://tinygo.org',
  github: 'https://github.com/tinygo-org/tinygo',
  programs: ['tinygo'],
  platforms: ['darwin/aarch64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'tinygo-org/tinygo',
  },
  distributable: {
    url: 'git+https://github.com/tinygo-org/tinygo.git',
  },
  dependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'mkdir -p /tmp/tinygo-extract',
      'TINYGO_VERSION="{{version}}"',
      'case "{{hw.platform}}/{{hw.arch}}" in',
      '  darwin/aarch64) TINYGO_ARCH="darwin-arm64" ;;',
      '  linux/x86-64) TINYGO_ARCH="linux-amd64" ;;',
      '  *) echo "Unsupported platform" && exit 1 ;;',
      'esac',
      'TINYGO_URL="https://github.com/tinygo-org/tinygo/releases/download/v${TINYGO_VERSION}/tinygo${TINYGO_VERSION}.${TINYGO_ARCH}.tar.gz"',
      'curl -fSL "$TINYGO_URL" | tar -xz --strip-components=1 -C /tmp/tinygo-extract',
      'mkdir -p {{prefix}}/bin {{prefix}}/lib',
      'cp -r /tmp/tinygo-extract/bin/* {{prefix}}/bin/ 2>/dev/null || true',
      'cp -r /tmp/tinygo-extract/lib/* {{prefix}}/lib/ 2>/dev/null || true',
      'cp -r /tmp/tinygo-extract/targets {{prefix}}/ 2>/dev/null || true',
      'cp -r /tmp/tinygo-extract/src {{prefix}}/ 2>/dev/null || true',
    ],
  },
}
