import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'volta.sh',
  name: 'volta',
  description: 'JavaScript toolchain manager for reproducible environments',
  homepage: 'https://volta.sh',
  github: 'https://github.com/volta-cli/volta',
  programs: ['volta', 'volta-shim', 'volta-migrate'],
  // Restrict to the 2.x line: older releases either fail to build from source
  // (unresolvable transitive Rust deps) or have inconsistent prebuilt asset
  // naming (openssl variants, no linux-arm, etc.). 2.x ships clean, uniform
  // official binaries for every platform we target.
  versionSource: {
    type: 'github-releases',
    repo: 'volta-cli/volta',
    tagPattern: /^v(2\..+)$/,
  },
  // Prebuilt download: volta ships official per-platform release tarballs
  // containing the `volta`, `volta-shim` and `volta-migrate` binaries. This is
  // a vanilla Rust CLI with no custom build-time configuration. The macOS
  // tarball is a universal (x86-64 + arm64) binary; linux ships per-arch.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="macos"     ;;',
      '  darwin+x86-64)  ASSET="macos"     ;;',
      '  linux+aarch64)  ASSET="linux-arm" ;;',
      '  linux+x86-64)   ASSET="linux"     ;;',
      'esac',
      '',
      'curl -Lfo volta.tar.gz "https://github.com/volta-cli/volta/releases/download/v${VERSION}/volta-${VERSION}-${ASSET}.tar.gz"',
      'tar xf volta.tar.gz',
      'install -Dm755 volta {{prefix}}/bin/volta',
      'install -Dm755 volta-shim {{prefix}}/bin/volta-shim',
      'install -Dm755 volta-migrate {{prefix}}/bin/volta-migrate',
    ],
  },
}
