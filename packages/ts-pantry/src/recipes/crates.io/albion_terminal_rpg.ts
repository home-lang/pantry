import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/albion_terminal_rpg",
  name: "albion_terminal_rpg",
  programs: [
    "albionrpg",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.56",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/rmj1001/albion-rpg/archive/68b1a93152b8dcd6b1cf536f6634dc0ff86da1de.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i '/fn main() {/a\\\n    if std::env::args().nth(1) == Some(\"--version\".to_string()) {\\\n        println!(\"albionrpg v{{ version }}\");\\\n        return;\\\n    }\\\n' main.rs\n",
        'working-directory': "src",
      },
      "cargo install --locked --path . --root {{prefix}}",
    ],
  },
}
