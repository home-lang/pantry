import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'argoproj.github.io/cd',
  name: 'cd',
  programs: [
    'argocd',
  ],
  buildDependencies: {
    'go.dev': '*',
    'nodejs.org': '<23',
    'classic.yarnpkg.com': '*',
    linux: {
      'git-scm.org': '*',
    },
  },
  distributable: {
    url: 'https://github.com/argoproj/argo-cd/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'NODE_ENV=development make --jobs {{hw.concurrency}} dep-ui-local',
      },
      {
        run: 'yarn build',
        'working-directory': 'ui',
      },
      'make --jobs {{hw.concurrency}} cli-local',
      'mkdir -p {{prefix}}/bin',
      'install dist/argocd {{prefix}}/bin/',
    ],
    env: {
      NODE_ENV: 'production',
      NODE_ONLINE_ENV: 'online',
      LDFLAGS: null,
    },
  },
  test: {
    script: [
      'argocd --help',
      'touch argocd-config',
      'chmod 0600 argocd-config',
      'argocd context --config ./argocd-config | grep "CURRENT  NAME  SERVER"',
    ],
  },
}
