import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'aws.amazon.com/q',
  name: 'q',
  programs: [
    'q',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.87',
  },
  distributable: {
    url: 'https://github.com/aws/amazon-q-developer-cli/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path crates/chat-cli --root {{prefix}} --bin chat_cli',
      {
        run: 'mv chat_cli q',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
  test: {
    script: [
      'q --help',
      'test "$(q --version)" = "qchat {{version}}"',
    ],
  },
}
