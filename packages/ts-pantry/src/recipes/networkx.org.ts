import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'networkx.org',
  name: 'networkx',
  description: 'Network Analysis in Python',
  homepage: 'https://networkx.org',
  github: 'https://github.com/networkx/networkx',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'networkx/networkx',
    tagPattern: /\/^networkx-\//,
  },
  distributable: {
    url: 'git+https://github.com/networkx/networkx.git',
  },
  dependencies: {
    'python.org': '>=3.11',
  },

  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
      'cd "${{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
    ],
  },
}
