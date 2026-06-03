import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/imessage-exporter',
  name: 'imessage-exporter',
  programs: [
    'imessage-exporter',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.95',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/ReagentX/imessage-exporter/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/^version = ".*"$/version = "{{version}}"/\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(imessage-exporter --version)" = "iMessage Exporter {{version}}"',
      'curl -LSsO https://raw.githubusercontent.com/ReagentX/imessage-exporter/refs/tags/{{version.tag}}/imessage-database/test_data/db/test.db',
      'imessage-exporter --diagnostics --db-path test.db 2>&1 | tee out',
      'grep \'iMessage Database Diagnostics\' out',
    ],
  },
}
