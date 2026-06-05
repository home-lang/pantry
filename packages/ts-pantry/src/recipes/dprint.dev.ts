import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dprint.dev',
  name: 'dprint',
  description: 'Pluggable and configurable code formatting platform written in Rust.',
  homepage: 'https://dprint.dev/',
  github: 'https://github.com/dprint/dprint',
  programs: ['dprint'],
  versionSource: {
    type: 'github-releases',
    repo: 'dprint/dprint',
  },
  // Prebuilt download: dprint ships official per-platform release zips
  // (Rust target triples; bare `dprint` binary at the archive root).
  // Release tags have no `v` prefix.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="dprint-aarch64-apple-darwin"       ;;',
      '  darwin+x86-64)  ASSET="dprint-x86_64-apple-darwin"        ;;',
      '  linux+aarch64)  ASSET="dprint-aarch64-unknown-linux-gnu"  ;;',
      '  linux+x86-64)   ASSET="dprint-x86_64-unknown-linux-gnu"   ;;',
      'esac',
      '',
      'curl -Lfo dprint.zip "https://github.com/dprint/dprint/releases/download/${VERSION}/${ASSET}.zip"',
      'unzip -q dprint.zip',
      'install -Dm755 dprint {{prefix}}/bin/dprint',
    ],
  },
}
