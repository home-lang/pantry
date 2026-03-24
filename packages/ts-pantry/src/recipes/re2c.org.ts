import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 're2c.org',
  name: 're2c',
  description: 'Lexer generator for C, C++, D, Go, Haskell, Java, JS, OCaml, Python, Rust, V and Zig.',
  homepage: 'https://re2c.org',
  github: 'https://github.com/skvadrik/re2c',
  programs: ['re2c'],
  versionSource: {
    type: 'github-releases',
    repo: 'skvadrik/re2c',
  },
  distributable: {
    url: 'https://github.com/skvadrik/re2c/releases/download/{{ version.raw }}/re2c-{{ version.raw }}.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'python.org': '^3.10',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"'],
    },
  },
}
