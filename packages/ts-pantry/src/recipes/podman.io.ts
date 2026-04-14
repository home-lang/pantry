import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'podman.io',
  name: 'podman',
  description: 'Podman: A tool for managing OCI containers and pods.',
  homepage: 'https://podman.io/',
  github: 'https://github.com/containers/podman',
  programs: ['podman', 'podman-remote', 'podman-mac-helper'],
  versionSource: {
    type: 'github-releases',
    repo: 'containers/podman',
  },
  distributable: {
    url: 'https://github.com/containers/podman/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'qemu.org': '*',
    'github.com/containers/gvisor-tap-vsock': '*',
  },
  buildDependencies: {
    'go.dev': '=1.24.2',
    'gnu.org/coreutils': '*',
  },

  build: {
    script: [
      'LOC=vendor/github.com/containers/common/pkg/config',
      'LOC=vendor/go.podman.io/common/pkg/config',
      'sed -i -f $PROP $LOC/config_{darwin,linux}.go',
      'mkdir -p "{{prefix}}"/bin',
      'make --jobs {{hw.concurrency}} podman-remote',
      'mv bin/podman-remote "{{prefix}}"/bin/',
      'ln -s podman-remote "{{prefix}}"/bin/podman',
      '',
      'make --jobs {{hw.concurrency}} podman-mac-helper',
      'mv bin/darwin/podman{-mac-helper,} "{{prefix}}"/bin/',
      'ln -s podman "{{prefix}}"/bin/podman-remote',
      '',
    ],
    env: {
      'CGO_ENABLED': '0',
    },
  },
}
