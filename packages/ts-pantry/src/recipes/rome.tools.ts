import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rome.tools',
  name: 'rome',
  description: 'Unified developer tools for JavaScript, TypeScript, and the web',
  homepage: 'https://docs.rome.tools/',
  github: 'https://github.com/rome/tools',
  programs: ['rome'],
  versionSource: {
    type: 'github-releases',
    repo: 'rome/tools',
    // Rome's CLI releases are tagged `cli/v12.1.3` (the repo also carries
    // `lsp/v*`, `js-api/v*` and `*-nightly`/`*-next` prerelease tags).
    tagPattern: /^cli\/v(.+)$/,
  },
  distributable: {
    // Tag is `cli/v{{version}}`, so the source tarball path includes the prefix.
    url: 'https://github.com/rome/tools/archive/refs/tags/cli/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    // pkgx builds from the `crates/rome_cli` workspace member, not the
    // workspace root (the root Cargo.toml is a virtual manifest with no bin).
    workingDirectory: 'crates/rome_cli',
    script: [
      'sed -i.bak \'s/version = "0.0.0"/version = "{{version}}"/\' Cargo.toml',
      'rm Cargo.toml.bak',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
