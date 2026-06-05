import type { Recipe } from '../../../../scripts/recipe-types'

// llrt ships official prebuilt release binaries for every platform we target.
// Each release publishes `llrt-<platform>.zip` containing a single `llrt` binary.
// Release tags carry a `-beta` suffix (e.g. v0.8.1-beta) while our registered
// versions are bare (0.8.1). Download the official asset instead of building
// from source (which required rustup nightly + yarn + git submodules).
export const recipe: Recipe = {
  domain: 'github.com/awslabs/llrt',
  name: 'llrt',
  programs: [
    'llrt',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'awslabs/llrt',
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="darwin-arm64" ;;',
      '  darwin+x86-64)  PLATFORM="darwin-x64" ;;',
      '  linux+aarch64)  PLATFORM="linux-arm64" ;;',
      '  linux+x86-64)   PLATFORM="linux-x64" ;;',
      'esac',
      '',
      'URL="https://github.com/awslabs/llrt/releases/download/v${VERSION}-beta/llrt-${PLATFORM}.zip"',
      'curl -Lfo llrt.zip "$URL"',
      'unzip -o llrt.zip',
      'install -Dm755 llrt {{prefix}}/bin/llrt',
    ],
  },
  test: {
    // Note: upstream's prebuilt binary is not always version-bumped (e.g. the
    // v0.8.1-beta release ships a binary that reports v0.8.0-beta), so only
    // assert that the binary runs rather than matching the exact version.
    script: [
      'llrt --version',
    ],
  },
}
