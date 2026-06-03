import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/eureka',
  name: 'eureka',
  programs: [
    'eureka',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/simeg/eureka/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}} --locked',
    ],
  },
  test: {
    script: [
      'git init',
      'mkdir -p $HOME/.config/eureka',
      'echo "{\\"repo\\":\\"$(pwd)\\"}" > $HOME/.config/eureka/config.json',
      'echo "this is an idea" >README.md',
      'test "$(eureka --view)" = "this is an idea"',
    ],
  },
}
