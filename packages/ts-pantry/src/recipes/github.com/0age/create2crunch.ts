import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/0age/create2crunch",
  name: "create2crunch",
  programs: [
    "create2crunch",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.56",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/0age/create2crunch/archive/f0ad004acc874e38f7bb1e3424d44d3536be8ac7.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i '/fn main() {/a\\\n    if std::env::args().nth(1) == Some(\"--version\".to_string()) {\\\n        println!(\"create2crunch v{{ version }}\");\\\n        return;\\\n    }\\\n' main.rs\n",
        'working-directory': "src",
      },
      "cargo install --locked --path . --root {{prefix}}",
    ],
  },
}
