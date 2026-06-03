import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'moonrepo.dev/moon',
  name: 'moon',
  programs: [
    'moon',
  ],
  buildDependencies: {
    'rust-lang.org': '*',
    'protobuf.dev': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/moonrepo/moon/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'if test -d crates/cli; then',
      'cargo install --locked --path crates/cli --root {{prefix}}',
      'elif test -d legacy/cli; then',
      'cargo install --locked --path legacy/cli --root {{prefix}}',
      'else',
      'cargo install --locked --path . --root {{prefix}}',
      'fi',
    ],
  },
  test: {
    script: [
      'moon init --minimal --yes',
      'test -f ".moon/workspace.yml"',
    ],
  },
}
