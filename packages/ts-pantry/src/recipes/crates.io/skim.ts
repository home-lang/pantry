import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/skim',
  name: 'skim',
  programs: [
    'sk',
  ],
  buildDependencies: {
    'rust-lang.org/rustup': '*',
  },
  distributable: {
    url: 'https://github.com/lotabout/skim/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'ln -sf {{deps.rust-lang.org/rustup.prefix}}/bin/rustup rustup',
        'working-directory': '$HOME/.cargo/bin',
      },
      {
        run: 'rustup default stable',
        if: '<1.3',
      },
      {
        run: 'rustup default nightly',
        if: '>=1.3<2',
      },
      {
        run: 'rustup default "$(sed -n \'s/^channel = "\\(.*\\)".*/\\1/p\' $SRCROOT/rust-toolchain.toml)"',
        if: '>=2',
      },
      {
        run: 'ln -sf $HOME/.rustup/toolchains/*/bin/* .',
        'working-directory': '$HOME/.cargo/bin',
      },
      {
        run: 'cargo install --path . --root {{prefix}} --locked',
        if: '<0.11.10 || >=1<1.3 || >=3.4',
      },
      {
        run: 'cargo install --path skim --root {{prefix}}',
        if: '>=0.11.10<1',
      },
      {
        run: 'cargo install --path . --root {{prefix}} --features nightly-frizbee',
        if: '>=1.3<3.4',
      },
      'cp bin/sk-tmux {{prefix}}/bin',
      'mkdir -p {{prefix}}/share',
      'cp -a shell man {{prefix}}/share/',
    ],
    env: {
      PATH: '$HOME/.cargo/bin:$PATH',
    },
  },
  test: {
    script: [
      'test "$(cat $FIXTURE | sk -f wld)" = "world"',
    ],
  },
}
