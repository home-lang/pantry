import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'railway.app',
  name: 'railway',
  description: 'Develop and deploy code with zero configuration',
  homepage: 'https://railway.app/',
  github: 'https://github.com/railwayapp/cli',
  programs: ['railway'],
  versionSource: {
    type: 'github-releases',
    repo: 'railwayapp/cli',
  },
  distributable: {
    url: 'git+https://github.com/railwayapp/cli.git',
  },
  buildDependencies: {
    'rust-lang.org': '^1.77',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'sed -i \'s/^version = ".*"$/version = "{{version}}"/\' Cargo.toml',
      'cargo add proc-macro2',
      'cargo install $ARGS',
      'cd "${{prefix}}/bin"',
      'otool -l railway | grep libiconv',
      'install_name_tool -change "@rpath/gnu.org/libiconv/v{{deps.gnu.org/libiconv.version}}/lib/libiconv.2.dylib" "/usr/lib/libiconv.2.dylib" railway',
      'otool -l railway | grep libiconv',
    ],
    env: {
      'ARGS': ['--root={{prefix}}', '--path=.', '--locked'],
    },
  },
}
