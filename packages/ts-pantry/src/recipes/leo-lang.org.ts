import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leo-lang.org',
  name: 'leo',
  description: '🦁 The Leo Programming Language. A Programming Language for Formally Verified, Zero-Knowledge Applications',
  homepage: 'https://leo-lang.org/',
  github: 'https://github.com/AleoHQ/leo',
  programs: ['leo'],
  versionSource: {
    type: 'github-releases',
    repo: 'AleoHQ/leo',
    tagPattern: /^v(.+)$/,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'curl.se': '^8.4',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
    'cmake.org': '^3', // as of 1.12.0 for libz-ng-sys crate
    'git-scm.org': '2', // as of 2.3.1 for the _required_ examples subrepo
  },
  distributable: {
    url: 'git+https://github.com/AleoHQ/leo',
  },

  build: {
    script: [
      'git submodule update --init --recursive',
      // 4.0.2 ships a bad version string in its Cargo.toml files
      { run: 'sed -i \'s/4\\.0\\.1/{{version}}/g\' $(find . -name Cargo.toml)', if: '=4.0.2' },
      { run: 'cargo install --locked --path . --root {{prefix}}', if: '<4' },
      { run: 'cargo install --locked --path crates/leo --root {{prefix}}', if: '>=4' },
    ],
  },
}
