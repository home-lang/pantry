import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ctop.sh',
  name: 'ctop',
  description: 'Top-like interface for container metrics',
  homepage: 'https://bcicen.github.io/ctop/',
  github: 'https://github.com/bcicen/ctop',
  programs: ['ctop'],
  versionSource: {
    type: 'github-releases',
    repo: 'bcicen/ctop',
  },
  // Pre-built download recipe: upstream ships bare per-platform binaries
  // (ctop-<ver>-<os>-<arch>) for every release from 0.7.6 onward. There is no
  // darwin-arm64 asset, so on Apple Silicon we fall back to the darwin-amd64
  // binary (Rosetta 2 runs it). Older releases (<=0.7.5) ship no binaries.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+x86-64)  ASSET="ctop-${VERSION}-darwin-amd64" ;;',
      '  darwin+aarch64) ASSET="ctop-${VERSION}-darwin-amd64" ;;', // no arm64 build — Rosetta 2
      '  linux+x86-64)   ASSET="ctop-${VERSION}-linux-amd64"  ;;',
      '  linux+aarch64)  ASSET="ctop-${VERSION}-linux-arm64"  ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      // The upstream git-tag prefix is inconsistent across releases (0.7.6 is
      // tagged "0.7.6", 0.7.7 is tagged "v0.7.7"). The asset filename always
      // uses the bare version. Try both tag forms so the recipe is robust
      // regardless of how {{version.tag}} resolves.
      'BASE="https://github.com/bcicen/ctop/releases/download"',
      'curl -Lfo ctop "${BASE}/v${VERSION}/${ASSET}" \\',
      '  || curl -Lfo ctop "${BASE}/${VERSION}/${ASSET}"',
      'install -Dm755 ctop {{prefix}}/bin/ctop',
    ],
  },
  test: {
    script: [
      '{{prefix}}/bin/ctop -v',
    ],
  },
}
