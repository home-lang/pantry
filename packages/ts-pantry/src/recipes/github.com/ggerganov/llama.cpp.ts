import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ggerganov/llama.cpp',
  name: 'llama',
  programs: [
    'llama-cli',
    'llama.cpp',
  ],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64', 'linux/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'ggerganov/llama.cpp',
    tagPattern: /^b(\d+)$/,
  },
  distributable: null,
  dependencies: {
    linux: {
      'gnu.org/gcc/libstdcxx': '14',
      'gnu.org/gcc': '14',
    },
  },
  build: {
    script: [
      'BASE="{{version}}"',
      'BASE="${BASE%%.*}"',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="llama-b${BASE}-bin-macos-arm64.tar.gz" ;;',
      '  darwin+x86-64) ASSET="llama-b${BASE}-bin-macos-x64.tar.gz" ;;',
      '  linux+x86-64) ASSET="llama-b${BASE}-bin-ubuntu-x64.tar.gz" ;;',
      '  linux+aarch64) ASSET="llama-b${BASE}-bin-ubuntu-arm64.tar.gz" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo "$ASSET" "https://github.com/ggml-org/llama.cpp/releases/download/b${BASE}/$ASSET"',
      'tar -xzf "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'cp -R "llama-b${BASE}/." {{prefix}}/bin/',
      'chmod +x {{prefix}}/bin/llama* {{prefix}}/bin/rpc-server 2>/dev/null || true',
      'ln -sf llama-cli {{prefix}}/bin/llama.cpp',
    ],
  },
  test: {
    script: [
      'test -s {{prefix}}/bin/llama-cli',
      'test -x {{prefix}}/bin/llama-cli',
      'test -L {{prefix}}/bin/llama.cpp',
    ],
  },
}
