import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'asciinema.org',
  name: 'asciinema',
  description: 'Record and share terminal sessions',
  homepage: 'https://asciinema.org',
  github: 'https://github.com/asciinema/asciinema',
  programs: ['asciinema'],
  versionSource: {
    type: 'github-releases',
    repo: 'asciinema/asciinema',
  },
  distributable: {
    url: 'https://github.com/asciinema/asciinema/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '^3.12',
  },
  buildDependencies: {
    'rust-lang.org': '^1.75',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/asciinema',
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
