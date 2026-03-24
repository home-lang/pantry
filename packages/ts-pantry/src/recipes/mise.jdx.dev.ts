import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mise.jdx.dev',
  name: 'mise',
  description: 'dev tools, env vars, task runner',
  homepage: 'https://mise.jdx.dev',
  github: 'https://github.com/jdx/mise',
  programs: ['rtx', 'mise'],
  versionSource: {
    type: 'github-releases',
    repo: 'jdx/mise',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/jdx/mise/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'libgit2.org': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.78',
    'rust-lang.org/cargo': '*',
    'cmake.org': '3',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
      'cd "{{prefix}}/bin"',
      'if test -f rtx; then',
      '  ln -s rtx mise',
      'elif test -f mise; then',
      '  ln -s mise rtx',
      'fi',
      '',
    ],
  },
}
