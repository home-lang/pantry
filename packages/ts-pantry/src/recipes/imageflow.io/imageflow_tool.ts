import type { Recipe } from '../../../scripts/recipe-types'

// DOWNLOAD recipe: upstream ships official prebuilt per-platform tarballs that
// contain imageflow_tool (linux-x64, linux-arm64, osx-x86_64, osx-arm64), so we
// download them instead of doing the source build that needs a removed Rust
// nightly feature (feature(stdsimd), pinned rust >=1.65<1.78). Download-first.
// The asset filename embeds a per-release commit hash, so we resolve the exact
// download URL from the GitHub releases API rather than templating it.
export const recipe: Recipe = {
  domain: 'imageflow.io/imageflow_tool',
  name: 'imageflow_tool',
  homepage: 'https://imageflow.io',
  github: 'https://github.com/imazen/imageflow',
  platforms: [
    'linux/x86-64',
    'linux/aarch64',
    'darwin/x86-64',
    'darwin/aarch64',
  ],
  programs: [
    'imageflow_tool',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'imazen/imageflow',
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  linux+x86-64)   PAT="linux-x64"    ;;',
      '  linux+aarch64)  PAT="linux-arm64"  ;;',
      '  darwin+x86-64)  PAT="osx-x86_64"   ;;',
      '  darwin+aarch64) PAT="osx-arm64"    ;;',
      '  *) echo "unsupported platform {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '# Asset name embeds a commit hash; resolve the real download URL from the API.',
      'URL=$(curl -fsSL "https://api.github.com/repos/imazen/imageflow/releases/tags/v${VERSION}" \\',
      '  | grep -o "https://[^\\"]*imageflow-v${VERSION}-[0-9a-f]*-${PAT}\\.tar\\.gz" | head -1)',
      'test -n "$URL" || { echo "no imageflow asset for ${PAT} v${VERSION}" >&2; exit 1; }',
      'curl -Lfo imageflow.tar.gz "$URL"',
      'mkdir -p extracted && tar xzf imageflow.tar.gz -C extracted',
      'BIN=$(find extracted -type f -name imageflow_tool | head -1)',
      'install -Dm755 "$BIN" {{prefix}}/bin/imageflow_tool',
    ],
  },
  test: {
    script: ['{{prefix}}/bin/imageflow_tool --version'],
  },
}
