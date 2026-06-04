import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cedarpolicy.com/cli',
  name: 'cli',
  programs: [
    'cedar',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/cedar-policy/cedar/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    workingDirectory: 'cedar-policy-cli',
    script: [
      {
        // version bump got missed in some releases; rewrite the workspace
        // Cargo.toml versions to match. Runs from the source root (one level
        // above cedar-policy-cli). The inline prop is written to $PROP — it was
        // dropped during the port, leaving sed with no script file.
        run: 'sed -i -f $PROP Cargo.toml */Cargo.toml',
        'working-directory': '..',
        prop: [
          's/^version = ".*"$/version = "{{version}}"/',
          's/^cedar-policy\\([-a-z]*\\) = { version = "[=^]*[0-9\\.]*"/cedar-policy\\1 = { version = "={{version}}"/',
        ].join('\n'),
      },
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
