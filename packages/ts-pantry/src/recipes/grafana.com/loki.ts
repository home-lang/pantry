import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'grafana.com/loki',
  name: 'loki',
  programs: [
    'loki',
  ],
  buildDependencies: {
    'go.dev': '=1.24.8',
    'git-scm.org': '*',
    'curl.se': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'git+https://github.com/grafana/loki',
  },
  build: {
    script: [
      {
        run: 'curl -L https://raw.githubusercontent.com/Homebrew/homebrew-core/1cf441a0/Patches/loki/loki-3.5.1-purego.patch | patch -p1',
        if: '>=3.5<3.6',
      },
      'go build -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/loki ./cmd/loki',
      'install -Dm755 cmd/loki/loki-local-config.yaml {{prefix}}/etc/loki-local-config.yaml',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/grafana/loki/pkg/util/build.Branch=$(git rev-parse --abbrev-ref HEAD)',
        '-X github.com/grafana/loki/pkg/util/build.Version={{version}}',
        '-X github.com/grafana/loki/pkg/util/build.Revision=$(git rev-parse --short HEAD)',
        '-X github.com/grafana/loki/pkg/util/build.BuildUser=pkgx',
        '-X github.com/grafana/loki/pkg/util/build.BuildDate=$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
        '-X github.com/grafana/loki/v3/pkg/util/build.Branch=$(git rev-parse --abbrev-ref HEAD)',
        '-X github.com/grafana/loki/v3/pkg/util/build.Version={{version}}',
        '-X github.com/grafana/loki/v3/pkg/util/build.Revision=$(git rev-parse --short HEAD)',
        '-X github.com/grafana/loki/v3/pkg/util/build.BuildUser=pkgx',
        '-X github.com/grafana/loki/v3/pkg/util/build.BuildDate=$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
          '-extldflags "-static"',
        ],
      },
    },
  },
  test: {
    script: [
      'loki --version | tee out',
      'grep {{version}} out',
    ],
  },
}
