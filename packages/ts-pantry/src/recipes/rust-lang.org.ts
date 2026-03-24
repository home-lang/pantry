import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'rust-lang.org',
  name: 'rust',
  description: 'Empowering everyone to build reliable and efficient software.',
  homepage: 'https://www.rust-lang.org/',
  github: 'https://github.com/rust-lang/rust',
  programs: [],
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
      'run: export ARGS="$ARGS --enable-optimize"',
      'run: sed -i -e \\s/CiEnv::is_ci()/CiEnv::is_ci() \\&\\& config.rust_info.is_managed_git_subrepository()/\\ native.rs',
      './configure $ARGS',
      'make install',
      '|',
      'rm -rf {{prefix}}/share/doc',
      'run: rustc $FIXTURE -o hello --crate-name hello',
      './hello',
    ],
  },
}
