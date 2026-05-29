import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dozzle.dev',
  name: 'dozzle',
  description: 'Realtime log viewer for docker containers. ',
  homepage: 'https://dozzle.dev/',
  github: 'https://github.com/amir20/dozzle',
  programs: ['dozzle'],
  versionSource: {
    type: 'github-releases',
    repo: 'amir20/dozzle',
  },
  distributable: {
    url: 'https://github.com/amir20/dozzle/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '=1.25.7',
    'pnpm.io': '*',
    'openssl.org': '*',
    'protobuf.dev': '*',
    'abseil.io': '20250127',
    'grpc.io/grpc-go': '*',
  },

  build: {
    script: [
      { run: 'make -j {{hw.concurrency}} tools', if: '<10' },
      { run: 'cp ~/go/bin/* .', if: '<10', 'working-directory': '${{prefix}}/bin' },
      'pnpm install',
      // otherwise on darwin/aarch64: EMFILE: too many open files, watch
      { run: 'sudo launchctl limit maxfiles 16384 16384', if: 'darwin/aarch64' },
      'make dist generate',
      'go build -ldflags "$GO_LDFLAGS" -o {{prefix}}/bin/dozzle .',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/amir20/dozzle/internal/support/cli.Version={{version}}'],
    },
  },
}
