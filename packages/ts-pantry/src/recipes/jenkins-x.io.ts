import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'jenkins-x.io',
  name: 'Jenkins X',
  description: 'Jenkins X provides automated CI+CD for Kubernetes with Preview Environments on Pull Requests using Cloud Native pipelines from Tekton',
  homepage: 'https://jenkins-x.io/',
  github: 'https://github.com/jenkins-x/jx',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'jenkins-x/jx',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/jenkins-x/jx/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for jenkins-x.io"',    ],
  },
}
