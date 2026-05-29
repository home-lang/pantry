import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubeshark.co',
  name: 'kubeshark',
  description: 'The API traffic analyzer for Kubernetes providing real-time K8s protocol-level visibility, capturing and monitoring all traffic and payloads going in, out and across containers, pods, nodes and clusters. Inspired by Wireshark, purposely built for Kubernetes',
  homepage: 'https://www.kubeshark.co/',
  github: 'https://github.com/kubeshark/kubeshark',
  programs: ['kubeshark'],
  versionSource: {
    type: 'github-releases',
    repo: 'kubeshark/kubeshark',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/kubeshark/kubeshark',
    ref: 'v{{version.raw}}',
  },
  buildDependencies: {
    'go.dev': '^1.19',
    'gnu.org/make': '*',
    'git-scm.org': '*',
  },

  build: {
    script: [
      'make build',
      'mkdir -p "{{prefix}}"/bin',
      'mv bin/kubeshark_$PLATFORM "{{prefix}}"/bin/kubeshark',
      '',
    ],
    env: {
      'VER': '{{version}}',
      'darwin/aarch64': { PLATFORM: 'darwin_arm64', GOOS: 'darwin', GOARCH: 'arm64' },
      'darwin/x86-64': { PLATFORM: 'darwin_amd64', GOOS: 'darwin', GOARCH: 'amd64' },
      'linux/aarch64': { PLATFORM: 'linux_arm64', GOOS: 'linux', GOARCH: 'arm64' },
      'linux/x86-64': { PLATFORM: 'linux_amd64', GOOS: 'linux', GOARCH: 'amd64' },
    },
  },
}
