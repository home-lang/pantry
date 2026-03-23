import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'elixir-lang.org',
  name: 'elixir-lang',
  description: 'Elixir is a dynamic, functional language for building scalable and maintainable applications',
  homepage: 'https://elixir-lang.org/',
  github: 'https://github.com/elixir-lang/elixir',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'elixir-lang/elixir',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/elixir-lang/elixir/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for elixir-lang.org"',    ],
  },
}
