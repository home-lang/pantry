import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'project-copacetic.github.io',
  name: 'copa',
  description: 'Tool to directly patch container images given the vulnerability scanning results',
  homepage: 'https://project-copacetic.github.io/copacetic/',
  github: 'https://github.com/project-copacetic/copacetic',
  programs: ['copa'],
  versionSource: {
    type: 'github-releases',
    repo: 'project-copacetic/copacetic',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/project-copacetic/copacetic.git',
  },

  build: {
    script: [
      'echo "Build not yet configured for project-copacetic.github.io"',    ],
  },
}
