import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vlang.io',
  name: 'v',
  description: 'Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io',
  github: 'https://github.com/vlang/v',
  programs: ['v'],
  versionSource: {
    type: 'github-releases',
    repo: 'vlang/v',
  },
  distributable: {
    url: 'https://github.com/vlang/v/archive/refs/tags/{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'git-scm.org': '*',
  },

  build: {
    script: [
      'if test "{{version}}" = "0.3.2"; then',
      '  git apply props/int-types.diff',
      'fi',
      '',
      'make prod=1',
      'mkdir -p "{{prefix}}/"{libexec,bin}',
      'cp -R cmd thirdparty v v.mod vlib {{prefix}}/libexec/',
      'cd {{prefix}}/bin',
      'ln -s ../libexec/v v',
    ],
  },
}
