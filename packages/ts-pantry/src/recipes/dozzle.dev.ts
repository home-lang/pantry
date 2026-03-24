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
      'make -j {{hw.concurrency}} tools',
      'cd "${{prefix}}/bin"',
      'cp ~/go/bin/* .',
      'pnpm install',
      'sudo launchctl limit maxfiles 16384 16384',
      'make dist generate',
      'go build -ldflags "$GO_LDFLAGS" -o {{prefix}}/bin/dozzle .',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/amir20/dozzle/internal/support/cli.Version={{version}}'],
    },
  },
}
