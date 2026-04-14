import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'julialang.org',
  name: 'julia',
  description: 'The Julia Programming Language',
  homepage: 'https://julialang.org/',
  github: 'https://github.com/JuliaLang/julia',
  programs: ['julia'],
  versionSource: {
    type: 'github-releases',
    repo: 'JuliaLang/julia',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,
  buildDependencies: {
    'curl.se': '*',
    'gnu.org/tar': '*',
  },

  build: {
    script: [
      'curl -L "https://julialang-s3.julialang.org/bin/$PLATFORM/$ARCH/{{version.major}}.{{version.minor}}/julia-{{version.raw}}-$TRIPLE.tar.gz" | tar zxvf - --strip-components=1',
      'mkdir -p "{{prefix}}"',
      'cp -av ./* {{prefix}}/',
    ],
    skip: ['fix-machos'],
  },
}
