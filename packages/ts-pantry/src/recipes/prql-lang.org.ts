import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'prql-lang.org',
  name: 'prql',
  description: 'PRQL is a modern language for transforming data — a simple, powerful, pipelined SQL replacement',
  homepage: 'https://prql-lang.org',
  github: 'https://github.com/PRQL/prql',
  programs: ['', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'PRQL/prql',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/PRQL/prql/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: cargo install --path prql-compiler --root {{prefix}}',
      'run: cargo install --path prql-compiler --root {{prefix}} --all-features',
      'run: cargo install --path prql-compiler/prqlc --root {{prefix}}',
      'run: cargo install --path crates/prqlc --root {{prefix}} --all-features',
      'run: cargo install --path prqlc/prqlc --root {{prefix}} --locked --all-features',
      'run: ln -s prql-compiler prqlc',
      'run: ln -s prqlc prql-compiler',
    ],
  },
}
