import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'iroh.computer',
  name: 'iroh',
  description: 'peer-2-peer that just works',
  homepage: 'https://iroh.computer',
  github: 'https://github.com/n0-computer/iroh',
  programs: ['iroh'],
  versionSource: {
    type: 'github-releases',
    repo: 'n0-computer/iroh',
  },

  distributable: {
    url: 'https://github.com/n0-computer/iroh/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  buildDependencies: {
    'rust-lang.org/cargo': '*',
    'rust-lang.org': '^1.78', // stdsimd changes
    linux: {
      'gnu.org/gcc': '14', // since 0.92
    },
  },

  build: {
    env: {
      linux: {
        RUSTFLAGS: '$RUSTFLAGS -C linker=gcc',
      },
    },
    script: [
      { run: 'cargo install --path . --locked --root {{prefix}}', if: '<0.6.0' },
      { run: 'cargo install --path iroh --locked --root {{prefix}}', if: '>=0.6.0<0.13.0' },
      { run: 'cargo install --path iroh-cli --locked --root {{prefix}}', if: '>=0.13.0<0.28.1' },
      { run: 'cargo install --path iroh-cli --root {{prefix}}', if: '>=0.28.1<0.29' },
      {
        run: [
          'cargo install --path iroh-relay --root {{prefix}}',
          'cargo install --path iroh-dns-server --root {{prefix}}',
          'ln -s iroh-relay {{prefix}}/bin/iroh',
        ],
        if: '>=0.29<0.30',
      },
      {
        run: [
          'cargo install --path iroh-relay --root {{prefix}} --features server',
          'cargo install --path iroh-dns-server --root {{prefix}}',
          'ln -s iroh-relay {{prefix}}/bin/iroh',
        ],
        if: '>=0.30',
      },
    ],
  },
}
