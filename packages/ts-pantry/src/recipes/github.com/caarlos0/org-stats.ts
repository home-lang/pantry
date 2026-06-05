import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/caarlos0/org-stats',
  name: 'org-stats',
  programs: [
    'org-stats',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  // Prebuilt download (1.7.0+): org-stats is a vanilla Go CLI that ships
  // official goreleaser tarballs (single `org-stats` binary; darwin is a
  // universal `_all` archive). Download the official binary; older releases
  // (pre-1.7.0) predate the prebuilts and fall back to a source build.
  distributable: {
    url: 'https://github.com/caarlos0/org-stats/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // Prebuilt download path for 1.7.0+.
      {
        run: [
          'VERSION={{version}}',
          'case {{hw.platform}}+{{hw.arch}} in',
          '  darwin+aarch64) ASSET="darwin_all"   ;;',
          '  darwin+x86-64)  ASSET="darwin_all"   ;;',
          '  linux+aarch64)  ASSET="linux_arm64"  ;;',
          '  linux+x86-64)   ASSET="linux_amd64"  ;;',
          'esac',
          'curl -Lfo org-stats.tar.gz "https://github.com/caarlos0/org-stats/releases/download/v${VERSION}/org-stats_${ASSET}.tar.gz"',
          'tar xf org-stats.tar.gz',
          'install -Dm755 org-stats {{prefix}}/bin/org-stats',
        ].join('\n'),
        if: '>=1.7.0',
      },
      // Source-build fallback for pre-1.7.0 (no prebuilt releases exist).
      { run: 'go mod download', if: '<1.7.0' },
      {
        run: 'sed -i \'s/info\\.Main\\.Version/{{version}}/g\' version.go',
        'working-directory': 'cmd',
        if: '<1.7.0',
      },
      { run: 'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .', if: '<1.7.0' },
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: '0',
      BUILDLOC: '{{prefix}}/bin/org-stats',
      LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
