import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pkl-lang.org',
  name: 'pkl-lang',
  description: 'A configuration as code language with rich validation and tooling.',
  homepage: 'https://pkl-lang.org',
  github: 'https://github.com/apple/pkl',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'apple/pkl',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/apple/pkl/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: |',
      'run: |',
      './gradlew -DreleaseBuild=true $TARGETS',
      'run:',
      'run:',
    ],
  },
}
