import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tea.xyz',
  name: 'tea/cli',
  description: 'Run Anything',
  homepage: 'https://pkgx.sh',
  github: 'https://github.com/teaxyz/cli',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'teaxyz/cli',
  },
  distributable: {
    url: 'https://github.com/teaxyz/cli/releases/download/v{{version}}/tea-{{version}}.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'deno.land': '>=1.23 <1.25 || ^1.25.3',
  },

  build: {
    script: [
      'deno task --config "$SRCROOT"/deno.jsonc compile',
    ],
    skip: ['fix-patchelf'],
  },
}
