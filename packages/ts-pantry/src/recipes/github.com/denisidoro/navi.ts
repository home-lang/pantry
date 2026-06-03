import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/denisidoro/navi',
  name: 'navi',
  programs: [
    'navi',
  ],
  buildDependencies: {
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/denisidoro/navi/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(navi --version)" = "navi {{version}}"',
      'cp $FIXTURE hello-world.cheat',
      'NAVI_PATH=. navi --query "Print hello world" --best-match | grep "hello world"',
    ],
  },
}
