import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'biomejs.dev',
  name: 'biome',
  description: 'A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP.',
  homepage: 'https://biomejs.dev/',
  github: 'https://github.com/biomejs/biome',
  programs: ['biome'],
  versionSource: {
    type: 'github-releases',
    repo: 'biomejs/biome',
    tagPattern: /(cli\/v|@biomejs\/biome@)(.+)$/,
  },
  // Biome's CLI is tagged on GitHub as `@biomejs/biome@<version>` (the monorepo
  // uses scoped per-crate tags). The `{{version.tag}}` machinery can't recover
  // this for native recipes (it falls back to the `v<version>` heuristic, which
  // 404s), so hardcode the real 2.x tag scheme directly. The literal `@`/`/` are
  // passed through verbatim by the templating + curl and resolve to a 200.
  distributable: {
    url: 'https://github.com/biomejs/biome/archive/refs/tags/@biomejs/biome@{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.83',
    'rust-lang.org/cargo': '*',
  },

  build: {
    workingDirectory: 'crates/biome_cli',
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
    env: {
      RUSTFLAGS: '-C strip=symbols',
      BIOME_VERSION: 'v{{version}}',
    },
  },
}
