import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'k9scli.io',
  name: 'k9s',
  description: '🐶 Kubernetes CLI To Manage Your Clusters In Style!',
  homepage: 'https://k9scli.io/',
  github: 'https://github.com/derailed/k9s',
  programs: ['k9s'],
  versionSource: {
    type: 'github-releases',
    repo: 'derailed/k9s',
  },
  distributable: {
    url: 'https://github.com/derailed/k9s/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
    'gnu.org/make': '*',
    'git-scm.org': '*',
  },

  build: {
    script: [
      'make build',
      'mkdir -p "{{prefix}}"/bin',
      'mv ./execs/k9s "{{prefix}}"/bin',
      '',
    ],
  },
}
