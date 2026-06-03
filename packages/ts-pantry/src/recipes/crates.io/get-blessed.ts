import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/get-blessed",
  name: "get-blessed",
  programs: [
    "get-blessed",
  ],
  dependencies: {
    linux: {
      'openssl.org': "*",
    },
  },
  buildDependencies: {
    'rust-lang.org': ">=1.56",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/josueBarretogit/get_blessed_rs/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i '/fn main()/a\\\n    if std::env::args().nth(1) == Some(\"--version\".to_string()) {\\\n        println!(\"get-blessed v{{ version }}\");\\\n        return Ok(());\\\n    }\\\n' main.rs\n",
        'working-directory': "src",
      },
      "cargo install --locked --path . --root {{prefix}}",
    ],
  },
}
