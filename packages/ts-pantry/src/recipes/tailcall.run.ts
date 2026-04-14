import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tailcall.run',
  name: 'tailcall',
  description: 'High Performance GraphQL Runtime',
  homepage: 'https://tailcall.run',
  github: 'https://github.com/tailcallhq/tailcall',
  programs: ['tailcall'],
  versionSource: {
    type: 'github-releases',
    repo: 'tailcallhq/tailcall',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://tailcall.gateway.scarf.sh/archive/refs/tags/tailcall-v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'protobuf.dev': '*',
  },

  build: {
    script: [
      'sed -i \'s|protoc_bin_vendored::protoc_bin_path().expect("Failed to find protoc binary")|Path::new("{{deps.protobuf.dev.prefix}}/bin/protoc")|\' build.rs',
      'cargo install --locked --path . --root {{prefix}}',
    ],
    env: {
      'APP_VERSION': '{{ version }}',
    },
  },
}
