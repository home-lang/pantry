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
    // pkgx pins the git checkout to the release tag (`ref: ${{version.tag}}`).
    // Without this the buildkit clones the default branch, which is a moving
    // target and may not match the version being built. The buildkit reads
    // `distributable.ref`; railwayapp/cli tags are `v{version}` and the
    // github-releases source strips the `v`, so `v{{version}}` resolves.
    ref: 'v{{version}}',
  } as Recipe['distributable'] & { ref: string },
  buildDependencies: {
    'rust-lang.org': '^1.77',
    'rust-lang.org/cargo': '*',
    // transitive on darwin, but pkgx pulls it in explicitly so the macho
    // relink step below can reference {{deps.gnu.org/libiconv.version}}.
    darwin: {
      'gnu.org/libiconv': '*',
    },
  },

  build: {
    script: [
      // 3.5.2 didn't bump version
      'sed -i \'s/^version = ".*"$/version = {{version}}/\' Cargo.toml',
      'cargo add proc-macro2',
      'cargo install $ARGS',
      // something weird links in unneeded iconv (seen in 4.27.5); strip it.
      // darwin-only — otool/install_name_tool don't exist on linux.
      {
        run: [
          'otool -l railway | grep libiconv',
          'install_name_tool -change "@rpath/gnu.org/libiconv/v{{deps.gnu.org/libiconv.version}}/lib/libiconv.2.dylib" "/usr/lib/libiconv.2.dylib" railway',
          'otool -l railway | grep libiconv',
        ],
        if: 'darwin',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      'ARGS': ['--root={{prefix}}', '--path=.', '--locked'],
    },
  },
}
