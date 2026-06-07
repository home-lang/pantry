import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-trim',
  name: 'git-trim',
  programs: [
    'git-trim',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
  },
  versionSource: {
    type: 'github-tags',
    repo: 'foriequal0/git-trim',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    // vergen requires a git repo, so we clone (not tarball) and check out the tag.
    url: 'git+https://github.com/foriequal0/git-trim',
    ref: 'v{{version}}',
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(git-trim --version)" = "git-trim {{version}}"',
    ],
  },
}
