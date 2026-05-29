import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git-cliff.org',
  name: 'git-cliff',
  description: 'A highly customizable Changelog Generator that follows Conventional Commit specifications ⛰️ ',
  homepage: 'https://git-cliff.org',
  github: 'https://github.com/orhun/git-cliff',
  programs: ['git-cliff'],
  versionSource: {
    type: 'github-releases',
    repo: 'orhun/git-cliff',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/orhun/git-cliff/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libgit2.org': '~1.7', // links to libgit2.so.1.7
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    workingDirectory: 'git-cliff',
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },

  test: {
    script: [
      'test "$(git-cliff --version)" = "git-cliff {{version}}"',
    ],
  },
}
