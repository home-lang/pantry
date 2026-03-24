import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'skaffold.dev',
  name: 'skaffold',
  description: 'Easy and Repeatable Kubernetes Development',
  homepage: 'https://skaffold.dev/',
  github: 'https://github.com/GoogleContainerTools/skaffold',
  programs: ['skaffold'],
  versionSource: {
    type: 'github-releases',
    repo: 'GoogleContainerTools/skaffold/tags',
  },
  distributable: null,
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'curl -Lfo skaffold https://storage.googleapis.com/skaffold/releases/v{{version}}/skaffold-$PLATFORM',
      'chmod +x skaffold',
      'mkdir -p bin',
      'mv skaffold bin',
      '',
    ],
  },
}
