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
    'darwin': {
      'github.com/crc-org/vfkit': '*',
    },
  },
  buildDependencies: {
    'go.dev': '=1.24.2',
    'gnu.org/coreutils': '*',
  },

  build: {
    script: [
      // podman searches a compile-time configured set of paths for helper
      // binaries, so we add a relative lookup for the major version of gvproxy
      // we require. The vendored config package moved in 5.7.
      { run: 'LOC=vendor/github.com/containers/common/pkg/config', if: '<5.7' },
      { run: 'LOC=vendor/go.podman.io/common/pkg/config', if: '>=5.7' },
      {
        run: 'sed -i -f $PROP $LOC/config_{darwin,linux}.go',
        prop: 's_\\(^var defaultHelperBinariesDir.*\\)_\\\n\\1\\n        "$BINDIR/../../../github.com/containers/gvisor-tap-vsock/v{{deps.github.com/containers/gvisor-tap-vsock.version.major}}/bin",_',
      },

      'mkdir -p "{{prefix}}"/bin',
      'make --jobs {{hw.concurrency}} podman-remote',

      {
        run: [
          'mv bin/podman-remote "{{prefix}}"/bin/',
          'ln -s podman-remote "{{prefix}}"/bin/podman',
        ],
        if: 'linux',
      },

      {
        run: [
          'make --jobs {{hw.concurrency}} podman-mac-helper',
          'mv bin/darwin/podman{-mac-helper,} "{{prefix}}"/bin/',
          'ln -s podman "{{prefix}}"/bin/podman-remote',
        ],
        if: 'darwin',
      },
    ],
    env: {
      'CGO_ENABLED': '0',
      'linux': {
        EXTRA_LDFLAGS: '-buildmode=pie',
      },
    },
  },
}
