import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ast-grep.github.io',
  name: 'ast-grep.github',
  description: '⚡A CLI tool for code structural search, lint and rewriting. Written in Rust',
  homepage: 'https://ast-grep.github.io/',
  github: 'https://github.com/ast-grep/ast-grep',
  programs: ['sg', 'ast-grep'],
  versionSource: {
    type: 'github-releases',
    repo: 'ast-grep/ast-grep',
    tagPattern: /^v?(.+)$/,
  },
  // Prebuilt download: ast-grep ships official per-platform release zips
  // (app-<triple>.zip containing both `ast-grep` and `sg` at the archive root).
  // Release tags have no `v` prefix.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="app-aarch64-apple-darwin"      ;;',
      '  darwin+x86-64)  ASSET="app-x86_64-apple-darwin"       ;;',
      '  linux+aarch64)  ASSET="app-aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   ASSET="app-x86_64-unknown-linux-gnu"  ;;',
      'esac',
      '',
      'curl -Lfo ast-grep.zip "https://github.com/ast-grep/ast-grep/releases/download/${VERSION}/${ASSET}.zip"',
      'unzip -q ast-grep.zip',
      'install -Dm755 ast-grep {{prefix}}/bin/ast-grep',
      'install -Dm755 sg {{prefix}}/bin/sg',
    ],
  },
}
