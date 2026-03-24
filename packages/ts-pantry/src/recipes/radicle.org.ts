import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'radicle.org',
  name: 'radicle',
  description: 'Radicle CLI',
  homepage: 'https://app.radicle.network/alt-clients.radicle.eth/radicle-cli',
  github: 'https://github.com/radicle-dev/radicle-cli',
  programs: ['rad', 'git-remote-rad', 'rad-account', 'rad-auth', 'rad-checkout', 'rad-clone', 'rad-edit', 'rad-ens', 'rad-gov', 'rad-help', 'rad-init', 'rad-inspect', 'rad-issue', 'rad-ls', 'rad-merge', 'rad-patch', 'rad-path', 'rad-pull', 'rad-push', 'rad-remote', 'rad-reward', 'rad-rm', 'rad-self', 'rad-sync', 'rad-track', 'rad-untrack'],
  versionSource: {
    type: 'github-releases',
    repo: 'radicle-dev/radicle-cli',
  },
  distributable: {
    url: 'https://github.com/radicle-dev/radicle-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1.1',
  },
  buildDependencies: {
    'rust-lang.org/cargo': '^0',
    'cmake.org': '^3',
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
      'cargo install --locked --path . --root {{prefix}}',
      '',
    ],
    env: {
      'RUSTFLAGS': '--cap-lints warn',
    },
  },
}
