import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'argoproj.github.io/workflows',
  name: 'workflows',
  programs: [
    'argo',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/argoproj/argo-workflows/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make GIT_TAG="v{{version}}" GIT_COMMIT="v{{version}}" RELEASE_TAG=true STATIC_FILES=false GIT_TREE_STATE=clean GOARGS= dist/argo-linux-amd64',
      'mkdir -p {{prefix}}/bin',
      'install dist/argo-linux-amd64 {{prefix}}/bin/argo',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
      ],
    },
  },
  test: {
    script: [
      'argo version | grep "v{{version}}"',
    ],
  },
}
