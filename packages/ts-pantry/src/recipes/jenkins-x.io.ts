import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jenkins-x.io',
  name: 'Jenkins X',
  description: 'Jenkins X provides automated CI+CD for Kubernetes with Preview Environments on Pull Requests using Cloud Native pipelines from Tekton',
  homepage: 'https://jenkins-x.io/',
  github: 'https://github.com/jenkins-x/jx',
  programs: ['jx'],
  versionSource: {
    type: 'github-releases',
    repo: 'jenkins-x/jx',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/jenkins-x/jx/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.24',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o {{prefix}}/bin/jx ./cmd',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/jenkins-x/jx/pkg/cmd/version.Version={{version}}',
      ],
    },
  },
}
