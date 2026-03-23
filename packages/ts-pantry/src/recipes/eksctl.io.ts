import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'eksctl.io',
  name: 'eksctl',
  description: 'Simple command-line tool for creating clusters on Amazon EKS',
  homepage: 'https://eksctl.io',
  github: 'https://github.com/eksctl-io/eksctl',
  programs: ['eksctl'],
  versionSource: {
    type: 'github-releases',
    repo: 'eksctl-io/eksctl',
  },
  distributable: {
    url: 'https://github.com/eksctl-io/eksctl/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/kubernetes-sigs/aws-iam-authenticator': '*',
  },
  buildDependencies: {
    'go.dev': '~1.25',
  },

  build: {
    script: [
      'go build -trimpath -ldflags="-s -w -X github.com/eksctl-io/eksctl/v2/pkg/version.gitTag=v{{version}}" -o {{prefix}}/bin/eksctl ./cmd/eksctl',
    ],
  },
}
