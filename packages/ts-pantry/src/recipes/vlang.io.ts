import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/vlang.io',
  domain: 'vlang.io',
  name: 'v',
  description: 'Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io',
  github: 'https://github.com/vlang/v',
  programs: ['v'],
  versionSource: {
    // Track V's STABLE tagged releases (e.g. 0.5.1) only — the repo also
    // publishes unstable `weekly.YYYY.WW` snapshots as GitHub releases, and
    // those broke the source build (e.g. weekly.2026.08 fails to compile with
    // an upstream `vlib/builtin/float.c.v` `$if` error). The tagPattern keeps
    // resolution on semver-style stable tags.
    type: 'github-releases',
    repo: 'vlang/v',
    tagPattern: /^(\d+\.\d+(?:\.\d+)?)$/,
  },
  distributable: {
    url: 'https://github.com/vlang/v/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'git-scm.org': '*',
  },

  build: {
    script: [
      // fixed in https://github.com/vlang/v/commit/ca484430e0380a3fc591b842aadda4fe18deaae5
      { run: 'git apply props/int-types.diff', if: '=0.3.2' },

      'make prod=1',

      'mkdir -p {{prefix}}/libexec',
      'cp -R cmd thirdparty v v.mod vlib {{prefix}}/libexec/',

      { run: 'ln -s ../libexec/v v', 'working-directory': '{{prefix}}/bin' },
    ],
  },
}
