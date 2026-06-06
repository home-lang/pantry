import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/qsv',
  name: 'qsv',
  programs: [
    'qsv',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'dathere/qsv',
  },
  // Prebuilt download: qsv (Rust) ships official per-platform release zips
  // (`qsv-<ver>-<target>.zip`) on github.com/dathere/qsv. The archives carry a
  // flat `qsv` binary (plus variants) — identical to a `cargo install`, but the
  // source build was failing on the heavy Rust/luau/cmake toolchain.
  // NOTE: upstream stopped shipping `x86_64-apple-darwin` after v2.0.0, so
  // darwin/x86-64 only resolves for older versions.
  distributable: null,

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
      'URL="https://github.com/dathere/qsv/releases/download/${VERSION}/qsv-${VERSION}-${TARGET}.zip"',
      'curl -Lfo qsv.zip "$URL"',
      'unzip -o qsv.zip',
      '',
      'install -Dm755 qsv {{prefix}}/bin/qsv',
    ],
  },

  test: {
    script: [
      'mv $FIXTURE test.csv',
      'qsv sort -s a -R -N test.csv',
      'test $(qsv count test.csv) -eq 5',
      'qsv dedup -q test.csv',
      'test $(qsv dedup -q test.csv | qsv count) -eq 4',
      'sed \'s/4,5,6/4,5,7/\' test.csv > test-diff.csv',
      'qsv diff test.csv test-diff.csv',
      'qsv diff test.csv test-diff.csv | qsv count | tee out',
      'test $(cat out) -eq 2 || test $(cat out) -eq 3',
    ],
  },
}
