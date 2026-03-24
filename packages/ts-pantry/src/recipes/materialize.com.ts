import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'materialize.com',
  name: 'mz',
  description: 'Real-time Data Integration and Transformation: use SQL to transform, deliver, and act on fast-changing data.',
  homepage: 'https://materialize.com',
  github: 'https://github.com/MaterializeInc/materialize',
  programs: ['mz'],
  versionSource: {
    type: 'github-releases',
    repo: 'MaterializeInc/materialize',
  },
  distributable: {
    url: 'git+https://github.com/MaterializeInc/materialize',
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'cmake.org': '^3',
    'perl.org': '*',
    'gnu.org/automake': '*',
    'gnu.org/autoconf': '*',
    'protobuf.dev': '26.1',
  },

  build: {
    script: [
      'cd "../build-tools"',
      'sed -i \'/^default =/s/"protobuf-src", //\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
    ],
    env: {
      'PROTOC_INCLUDE': '{{ deps.protobuf.dev.prefix }}/include',
    },
  },
}
