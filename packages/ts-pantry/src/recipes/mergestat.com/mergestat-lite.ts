import type { Recipe } from '../../../scripts/recipe-types'

// mergestat-lite ships official prebuilt release binaries. Each release publishes
// `mergestat-<os>-amd64.tar.gz` containing the `mergestat` binary plus the
// `libmergestat.so` loadable SQLite extension. Upstream only ships amd64/x86-64
// assets (no arm64), so only x86-64 platforms are covered. Download the official
// asset instead of compiling from source (which required cmake + libgit2 + python).
export const recipe: Recipe = {
  domain: 'mergestat.com/mergestat-lite',
  name: 'mergestat-lite',
  programs: [
    'mergestat',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'mergestat/mergestat-lite',
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+x86-64) OS="macos" ;;',
      '  linux+x86-64)  OS="linux" ;;',
      '  *) echo "mergestat-lite only ships prebuilt amd64 binaries upstream" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="https://github.com/mergestat/mergestat-lite/releases/download/v${VERSION}/mergestat-${OS}-amd64.tar.gz"',
      'curl -Lfo mergestat.tar.gz "$URL"',
      'tar xzf mergestat.tar.gz',
      'install -Dm755 ./mergestat {{prefix}}/bin/mergestat',
      'install -Dm755 ./libmergestat.so {{prefix}}/lib/libmergestat.so',
    ],
  },
  test: {
    script: [
      'mergestat --help',
    ],
  },
}
