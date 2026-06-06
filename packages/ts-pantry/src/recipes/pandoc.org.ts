import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pandoc.org',
  name: 'pandoc',
  description: 'Swiss-army knife of markup format conversion',
  homepage: 'https://pandoc.org/',
  github: 'https://github.com/jgm/pandoc',
  programs: ['pandoc'],
  versionSource: {
    type: 'github-releases',
    repo: 'jgm/pandoc',
    tagPattern: /^pandoc (.+)$/,
  },
  // Prebuilt download: pandoc is a Haskell project that is painful to build
  // from source. Upstream (github.com/jgm/pandoc) ships official per-platform
  // release archives that contain bin/pandoc (plus bin/pandoc-lua and
  // bin/pandoc-server on newer releases). We install the full bin set + man
  // pages, so the prebuilt is identical to a source build.
  //
  // Asset-naming notes (gated below):
  //  - Tags drop a trailing ".0" (e.g. our 3.9.0 -> upstream tag/asset "3.9",
  //    but 3.9.0.2 stays "3.9.0.2"). We strip a single trailing ".0".
  //  - macOS: from 3.1.2 onward, zips are arch-specific
  //    (pandoc-<v>-arm64-macOS.zip / pandoc-<v>-x86_64-macOS.zip). Older
  //    releases (<=3.1.1) ship a single x86_64-only pandoc-<v>-macOS.zip with
  //    no arm64 build.
  //  - linux: pandoc-<v>-linux-amd64.tar.gz / pandoc-<v>-linux-arm64.tar.gz
  //    across all tracked versions.
  distributable: null,

  build: {
    script: [
      // Normalize version to upstream tag/asset form (strip single trailing .0).
      'V=$(echo "{{version}}" | sed "s/\\.0$//")',
      'BASE="https://github.com/jgm/pandoc/releases/download/${V}"',
      'mkdir -p {{prefix}}/bin {{prefix}}/share/man/man1',
      'WORK=$(mktemp -d)',
      '',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="pandoc-${V}-arm64-macOS.zip"   ; KIND=zip ;;',
      '  darwin+x86-64)  ASSET="pandoc-${V}-x86_64-macOS.zip"  ; KIND=zip ;;',
      '  linux+aarch64)  ASSET="pandoc-${V}-linux-arm64.tar.gz"; KIND=tar ;;',
      '  linux+x86-64)   ASSET="pandoc-${V}-linux-amd64.tar.gz"; KIND=tar ;;',
      'esac',
      '',
      // macOS releases <= 3.1.1 have no arch suffix and ship x86_64 only.
      'if [ "{{hw.platform}}" = "darwin" ] && ! curl -sIfL -o /dev/null "${BASE}/${ASSET}"; then',
      '  ASSET="pandoc-${V}-macOS.zip"',
      'fi',
      '',
      'if [ "$KIND" = "zip" ]; then',
      '  curl -fSL -o "$WORK/pandoc.zip" "${BASE}/${ASSET}"',
      '  unzip -oq "$WORK/pandoc.zip" -d "$WORK/extract"',
      'else',
      '  mkdir -p "$WORK/extract"',
      '  curl -fSL "${BASE}/${ASSET}" | tar xz -C "$WORK/extract"',
      'fi',
      '',
      // Each archive has a single top-level dir with bin/ and share/man/man1/.
      'SRC=$(echo "$WORK"/extract/*)',
      'cp "$SRC"/bin/* {{prefix}}/bin/',
      'cp "$SRC"/share/man/man1/*.1* {{prefix}}/share/man/man1/ 2>/dev/null || true',
      'chmod +x {{prefix}}/bin/pandoc',
    ],
    skip: ['fix-patchelf'],
  },

  test: {
    script: [
      '{{prefix}}/bin/pandoc --version',
    ],
  },
}
