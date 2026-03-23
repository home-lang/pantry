import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'maturin.rs',
  name: 'maturin',
  description: 'Build and publish crates with pyo3, cffi and uniffi bindings as well as rust binaries as python packages',
  homepage: 'https://maturin.rs',
  github: 'https://github.com/PyO3/maturin',
  programs: ['maturin'],
  versionSource: {
    type: 'github-releases',
    repo: 'PyO3/maturin',
  },
  distributable: {
    url: 'https://github.com/PyO3/maturin/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.85',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'sed -i \'1,10s/^version = ".*"/version = "{{version}}"/\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
