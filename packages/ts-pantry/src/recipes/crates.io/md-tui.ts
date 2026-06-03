import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/md-tui",
  name: "md-tui",
  programs: [
    "mdt",
    "md-tui",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.56",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/henriklovhaug/md-tui/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i '/fn main() /a\\\n    if std::env::args().nth(1) == Some(\"--version\".to_string()) {\\\n        println!(\"md-tui v{{ version }}\");\\\n        return Ok(());\\\n    }\\\n' main.rs\n",
        'working-directory': "src",
      },
      "cargo install --locked --path . --root {{prefix}}",
      {
        run: "if test -f mdt; then\n  ln -s mdt md-tui\nelif test -f md-tui; then\n  ln -s md-tui mdt\nfi\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "test \"$(mdt --version)\" = \"md-tui v{{ version }}\"",
      "test \"$(md-tui --version)\" = \"md-tui v{{ version }}\"",
    ],
  },
}
