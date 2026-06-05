import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'argoproj.github.io/cd',
  name: 'cd',
  programs: [
    'argocd',
  ],
  buildDependencies: {
    'go.dev': '*',
    linux: {
      'git-scm.org': '*',
    },
  },
  distributable: {
    url: 'https://github.com/argoproj/argo-cd/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    // The `argocd` CLI (`make cli-local`) is a pure Go build and does NOT need
    // the web UI. Building the UI (dep-ui-local + yarn) pulls in node-gyp/fsevents
    // native builds that fail on darwin and require yarn 4 (box has yarn 1), so
    // skip it entirely — only the server embeds the UI, which we don't ship.
    script: [
      'make --jobs {{hw.concurrency}} cli-local',
      'mkdir -p {{prefix}}/bin',
      'install dist/argocd {{prefix}}/bin/',
    ],
    env: {
      LDFLAGS: '0',
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
