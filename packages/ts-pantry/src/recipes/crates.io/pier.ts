import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/pier',
  name: 'pier',
  programs: [
    'pier',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/pier-cli/pier/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'pier --help',
      'test "$(pier --version)" = "pier {{version}}"',
      'touch pier.toml',
      'pier add "ls -la" --alias ls',
      'cat pier.toml',
      'pier run ls',
    ],
  },
}
