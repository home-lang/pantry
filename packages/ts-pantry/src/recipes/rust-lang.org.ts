import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rust-lang.org',
  name: 'rust',
  description: 'Empowering everyone to build reliable and efficient software.',
  homepage: 'https://www.rust-lang.org/',
  github: 'https://github.com/rust-lang/rust',
  programs: ['cargo-clippy', 'cargo-fmt', 'clippy-driver', 'rust-analyzer', 'rust-gdb', 'rust-gdbgui', 'rust-lldb', 'rustc', 'rustdoc', 'rustfmt'],
  versionSource: {
    type: 'github-releases',
    repo: 'rust-lang/rust',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://static.rust-lang.org/dist/rustc-{{version}}-src.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'export ARGS="$ARGS --enable-optimize"',
      './configure $ARGS',
      'make install',
      'rm -rf {{prefix}}/share/doc',
    ],
  },
}
