import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'edgedb.com',
  name: 'edgedb',
  description: 'The EdgeDB CLI',
  homepage: 'https://www.edgedb.com/docs/cli/index',
  github: 'https://github.com/edgedb/edgedb-cli',
  programs: ['edgedb'],
  versionSource: {
    type: 'github-releases',
    repo: 'edgedb/edgedb-cli/tags',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/edgedb/edgedb-cli/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.61',
    'rust-lang.org/cargo': '^0',
    'perl.org': '^5',
  },

  build: {
    script: [
      'mv build.rs build.rs.bak || true',
      'cd "src"',
      'sed -i -e\'s|T::Argument => None|// T::Argument => None|\' highlight.rs',
      'sed -i \'1,40s/^version = .*$/version = "{{version.raw}}"/\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
      'cd "${{prefix}}/bin"',
      'if test -f gel && test ! -f edgedb; then',
      '  ln -s gel edgedb',
      'fi',
      '',
      'if test -f edgedb && test ! -f gel; then',
      '  ln -s edgedb gel',
      'fi',
      '',
    ],
    env: {
      'RUSTFLAGS': ['-A warnings', '-C debuginfo=0'],
    },
  },
}
