import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ninja-build.org',
  name: 'ninja',
  description: 'Small build system for use with gyp or CMake',
  homepage: 'https://ninja-build.org/',
  github: 'https://github.com/ninja-build/ninja',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'ninja-build/ninja',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/ninja-build/ninja/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for ninja-build.org"',    ],
  },
}
