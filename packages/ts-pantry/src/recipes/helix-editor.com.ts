import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'helix-editor.com',
  name: 'hx',
  description: 'A post-modern modal text editor.',
  homepage: 'https://helix-editor.com',
  github: 'https://github.com/helix-editor/helix',
  programs: ['hx'],
  versionSource: {
    type: 'github-releases',
    repo: 'helix-editor/helix',
    tagPattern: /^v?(.+)$/,
  },
  // Prebuilt download: Helix ships official per-platform release archives
  // (`helix-<tag>-<arch>-<os>.tar.xz`) that bundle the `hx` binary together with
  // the `runtime/` tree (grammars, queries, themes) that helix needs at runtime.
  // The source build is brittle — `helix-term/build.rs` fetches dozens of
  // tree-sitter grammars over the network and panics if any upstream grammar
  // repo has moved/disappeared (which broke CI repeatedly). The official
  // prebuilt is the exact same toolchain with none of that risk, so install the
  // whole tree into libexec and symlink the binary (V-compiler pattern).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      '',
      '# Map our stored version (e.g. 25.7.1 / 24.3.0) to helix\'s upstream release',
      '# tag, which zero-pads major+minor to two digits and DROPS a .0 patch:',
      '#   25.7.1 -> 25.07.1   25.7.0 -> 25.07   24.3.0 -> 24.03   23.10.0 -> 23.10',
      'MAJOR={{version.major}}',
      'MINOR=$(printf "%02d" {{version.minor}})',
      'PATCH={{version.patch}}',
      'if test "$PATCH" = "0"; then',
      '  TAG="${MAJOR}.${MINOR}"',
      'else',
      '  TAG="${MAJOR}.${MINOR}.${PATCH}"',
      'fi',
      '',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-macos" ;;',
      '  darwin+x86-64)  TARGET="x86_64-macos" ;;',
      '  linux+aarch64)  TARGET="aarch64-linux" ;;',
      '  linux+x86-64)   TARGET="x86_64-linux" ;;',
      'esac',
      '',
      'DIR="helix-${TAG}-${TARGET}"',
      'curl -Lfo hx.tar.xz "https://github.com/helix-editor/helix/releases/download/${TAG}/${DIR}.tar.xz"',
      'tar Jxf hx.tar.xz',
      '',
      '# helix locates its runtime/ relative to the real (symlink-resolved)',
      '# binary, so install the whole extracted tree and link `hx` into bin.',
      'mkdir -p {{prefix}}/libexec',
      'cp -R "${DIR}" {{prefix}}/libexec/helix',
      'mkdir -p {{prefix}}/bin',
      'ln -sf ../libexec/helix/hx {{prefix}}/bin/hx',
    ],
  },

  test: {
    script: [
      'hx --version',
    ],
  },
}
