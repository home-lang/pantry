import type { Recipe } from '../../scripts/recipe-types'

// kube-linter is a vanilla Go static-analysis tool that ships official prebuilt
// release binaries for every platform we target as `kube-linter-<os>[_arch].tar.gz`
// (each containing a single `kube-linter` binary), starting at v0.6.1. Download
// the official binary for those; fall back to a Go source build for the handful of
// older releases (<=0.6.0), which also use a bare (no `v`) source-archive tag.
export const recipe: Recipe = {
  domain: 'kubelinter.io',
  name: 'kube-linter',
  description: 'KubeLinter is a static analysis tool that checks Kubernetes YAML files and Helm charts to ensure the applications represented in them adhere to best practices.',
  homepage: 'https://docs.kubelinter.io/',
  github: 'https://github.com/stackrox/kube-linter',
  programs: ['kube-linter'],
  versionSource: {
    type: 'github-releases',
    repo: 'stackrox/kube-linter',
  },
  distributable: null,
  buildDependencies: {
    'go.dev': '^1.21',
  },
  build: {
    script: [
      // Prebuilt download path (v0.6.1+, which publish per-platform tarballs).
      {
        run: [
          'VERSION={{version}}',
          'case {{hw.platform}}+{{hw.arch}} in',
          '  darwin+aarch64) ASSET="kube-linter-darwin_arm64" ;;',
          '  darwin+x86-64)  ASSET="kube-linter-darwin" ;;',
          '  linux+aarch64)  ASSET="kube-linter-linux_arm64" ;;',
          '  linux+x86-64)   ASSET="kube-linter-linux" ;;',
          'esac',
          'URL="https://github.com/stackrox/kube-linter/releases/download/v${VERSION}/${ASSET}.tar.gz"',
          'curl -Lfo kube-linter.tar.gz "$URL"',
          'tar xzf kube-linter.tar.gz',
          'install -Dm755 kube-linter {{prefix}}/bin/kube-linter',
        ].join('\n'),
        if: '>=0.6.1',
      },
      // Source-build path for older releases without prebuilt assets. These use a
      // bare (no `v`) source-archive tag.
      {
        run: [
          'curl -Lfo src.tar.gz "https://github.com/stackrox/kube-linter/archive/{{version}}.tar.gz"',
          'tar xzf src.tar.gz --strip-components=1',
          'go build $ARGS -ldflags="$LDFLAGS" ./cmd/kube-linter',
        ].join('\n'),
        if: '<0.6.1',
      },
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-s', '-w', '-X golang.stackrox.io/kube-linter/internal/version.version={{version}}'],
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/kube-linter'],
    },
  },
}
