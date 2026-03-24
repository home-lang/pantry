import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pinniped.dev',
  name: 'pinniped',
  description: 'Pinniped is the easy, secure way to log in to your Kubernetes clusters.',
  homepage: 'https://pinniped.dev',
  github: 'https://github.com/vmware-tanzu/pinniped',
  programs: ['pinniped'],
  versionSource: {
    type: 'github-releases',
    repo: 'vmware-tanzu/pinniped/releases/tags',
  },
  distributable: {
    url: 'https://github.com/vmware-tanzu/pinniped/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -trimpath -ldflags="$LDFLAGS" -o "{{ prefix }}"/bin/pinniped ./cmd/pinniped',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-w', '-s', '-X go.pinniped.dev/internal/pversion.gitVersion=v{{version}}'],
    },
  },
}
