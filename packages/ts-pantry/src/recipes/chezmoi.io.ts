import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'chezmoi.io',
  name: 'chezmoi',
  description: 'Manage your dotfiles across multiple diverse machines, securely.',
  homepage: 'https://chezmoi.io/',
  github: 'https://github.com/twpayne/chezmoi',
  programs: ['chezmoi'],
  versionSource: {
    type: 'github-releases',
    repo: 'twpayne/chezmoi/tags',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/twpayne/chezmoi/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p "{{ prefix }}"/bin',
      'mv chezmoi "{{ prefix }}"/bin',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X main.version={{ version }}', '-X main.revision=tea'],
    },
  },
}
