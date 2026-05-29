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
    workingDirectory: 'tmp',
    script: [
      'curl -L "https://julialang-s3.julialang.org/bin/$PLATFORM/$ARCH/{{version.marketing}}/julia-{{version.raw}}-$TRIPLE.tar.gz" | tar zxvf - --strip-components=1',
      'mkdir -p "{{prefix}}"',
      'cp -av ./* {{prefix}}/',
    ],
    // since these are vendored, all paths are relative; we don't need to fix-machos
    skip: ['fix-machos'],
    env: {
      'linux/x86-64': {
        PLATFORM: 'linux',
        ARCH: 'x64',
        TRIPLE: 'linux-x86_64',
      },
      'linux/aarch64': {
        PLATFORM: 'linux',
        ARCH: 'aarch64',
        TRIPLE: 'linux-aarch64',
      },
      'darwin/x86-64': {
        PLATFORM: 'mac',
        ARCH: 'x64',
        TRIPLE: 'mac64',
      },
      'darwin/aarch64': {
        PLATFORM: 'mac',
        ARCH: 'aarch64',
        TRIPLE: 'macaarch64',
      },
    },
  },
}
