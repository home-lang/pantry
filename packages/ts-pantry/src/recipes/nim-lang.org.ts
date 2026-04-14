import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nim-lang.org',
  name: 'nim-lang',
  description: 'Nim is a statically typed compiled systems programming language. It combines successful concepts from mature languages like Python, Ada and Modula. Its design focuses on efficiency, expressiveness, and elegance (in that order of priority).',
  homepage: 'https://nim-lang.org',
  github: 'https://github.com/nim-lang/Nim',
  programs: ['nim', 'nim_dbg', 'testament', 'nimsuggest', 'nimgrep', 'nim-gdb', 'atlas', 'nimpretty', 'nimble'],
  versionSource: {
    type: 'github-releases',
    repo: 'nim-lang/Nim',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://nim-lang.org/download/nim-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'sh build.sh',
      './bin/nim c koch',
      './koch boot -d:release',
      './koch tools',
      './install.sh {{prefix}}',
    ],
  },
}
