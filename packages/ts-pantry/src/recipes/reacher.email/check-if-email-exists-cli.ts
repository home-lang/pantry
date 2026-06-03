import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'reacher.email/check-if-email-exists-cli',
  name: 'check-if-email-exists-cli',
  programs: [
    'check_if_email_exists',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'perl.org': '*',
  },
  distributable: {
    url: 'https://github.com/reacherhq/check-if-email-exists/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -e \'1,20s/^version = ".*"/version = "{{version}}"/\' core/Cargo.toml cli/Cargo.toml backend/Cargo.toml',
        'working-directory': '..',
      },
      {
        run: 'sed -i \'/check-if-email-exists =/s/ \\}/, features = ["sentry"] \\}/\' Cargo.toml',
        if: '^0.10',
      },
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
