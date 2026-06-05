import type { Recipe } from '../../../scripts/recipe-types'

// moon ships official prebuilt release binaries for every platform we target.
// - 1.x releases publish a plain binary named `moon-<target>`.
// - 2.x releases publish a tarball `moon_cli-<target>.tar.xz` containing `moon`
//   (and a `moonx` helper).
// Download the official asset instead of compiling from source via cargo.
export const recipe: Recipe = {
  domain: 'moonrepo.dev/moon',
  name: 'moon',
  programs: [
    'moon',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'moonrepo/moon',
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin" ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-gnu" ;;',
      'esac',
      '',
      'BASE="https://github.com/moonrepo/moon/releases/download/v${VERSION}"',
      'MAJOR=$(echo "$VERSION" | cut -d. -f1)',
      '',
      'if [ "$MAJOR" -ge 2 ]; then',
      '  # 2.x ships an xz tarball that extracts to moon_cli-<target>/',
      '  curl -Lfo moon.tar.xz "${BASE}/moon_cli-${TARGET}.tar.xz"',
      '  tar Jxf moon.tar.xz',
      '  install -Dm755 "moon_cli-${TARGET}/moon" {{prefix}}/bin/moon',
      '  if test -f "moon_cli-${TARGET}/moonx"; then',
      '    install -Dm755 "moon_cli-${TARGET}/moonx" {{prefix}}/bin/moonx',
      '  fi',
      'else',
      '  # 1.x ships a single plain binary',
      '  curl -Lfo moon "${BASE}/moon-${TARGET}"',
      '  install -Dm755 moon {{prefix}}/bin/moon',
      'fi',
    ],
  },
  test: {
    script: [
      'moon init --minimal --yes',
      'test -f ".moon/workspace.yml"',
    ],
  },
}
