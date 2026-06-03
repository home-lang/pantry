import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/awslabs/amazon-ecr-credential-helper',
  name: 'amazon-ecr-credential-helper',
  programs: [
    'docker-credential-ecr-login',
  ],
  buildDependencies: {
    'gnu.org/bash': '*',
    'gnu.org/make': '*',
    'git-scm.org': '*',
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'git+https://github.com/awslabs/amazon-ecr-credential-helper',
  },
  build: {
    script: [
      'make build',
      'mkdir -p {{prefix}}/bin',
      'cp bin/local/docker-credential-ecr-login {{prefix}}/bin/docker-credential-ecr-login',
    ],
  },
  test: {
    script: [
      'docker-credential-ecr-login -v | grep Version | grep {{version}}',
    ],
  },
}
