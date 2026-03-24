import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wasmer.io',
  name: 'wasmer',
  description: '🚀 Fast, secure, lightweight containers based on WebAssembly',
  homepage: 'https://wasmer.io',
  github: 'https://github.com/wasmerio/wasmer',
  programs: ['wasmer'],
  versionSource: {
    type: 'github-releases',
    repo: 'wasmerio/wasmer',
  },
  distributable: {
    url: 'https://github.com/wasmerio/wasmer/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '^0',
    'nodejs.org': '^18',
    'gnu.org/make': '^4',
  },

  build: {
    script: [
      'mkdir -p "{{prefix}}"/bin',
      'make build-wasmer',
      'mv target/release/wasmer "{{prefix}}"/bin',
    ],
    env: {
      'RUSTFLAGS': ['-A warnings', '-C debuginfo=0'],
    },
  },
}
