import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mkcert.dev',
  name: 'mkcert',
  description: 'A simple zero-config tool to make locally trusted development certificates',
  homepage: 'https://mkcert.dev',
  github: 'https://github.com/FiloSottile/mkcert',
  programs: ['mkcert'],
  versionSource: {
    type: 'github-releases',
    repo: 'FiloSottile/mkcert',
  },
  // Prebuilt download: mkcert ships official per-platform release binaries
  // (a single bare `mkcert-v<version>-<os>-<arch>` executable). It is a
  // vanilla Go CLI with no custom build-time configuration, so we download
  // the official binary instead of compiling. Older releases only published
  // linux-amd64 / darwin-amd64; arm64 binaries arrived in the 1.4.x line, so
  // arm64 falls back to a source build for versions that lack a prebuilt.
  distributable: {
    url: 'https://github.com/FiloSottile/mkcert/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      // Prebuilt download path (covers all x86-64; arm64 on 1.4.2+/1.4.4+).
      {
        run: [
          'VERSION={{version}}',
          'ASSET=""',
          'case {{hw.platform}}+{{hw.arch}} in',
          '  darwin+x86-64)  ASSET="darwin-amd64" ;;',
          '  linux+x86-64)   ASSET="linux-amd64"  ;;',
          'esac',
          'if [ -n "$ASSET" ]; then',
          '  curl -Lfo mkcert "https://github.com/FiloSottile/mkcert/releases/download/v${VERSION}/mkcert-v${VERSION}-${ASSET}"',
          '  install -Dm755 mkcert {{prefix}}/bin/mkcert',
          'else',
          '  go mod download',
          '  go build -v -ldflags="$LDFLAGS"',
          '  install -Dm755 mkcert {{prefix}}/bin/mkcert',
          'fi',
        ].join('\n'),
      },
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X=main.Version={{version}}'],
    },
  },
}
