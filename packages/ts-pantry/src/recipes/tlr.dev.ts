import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tlr.dev',
  name: 'teller',
  description: 'Cloud native secrets management for developers - never leave your command line for secrets.',
  github: 'https://github.com/SpectralOps/teller',
  programs: ['teller'],
  versionSource: {
    type: 'github-releases',
    repo: 'SpectralOps/teller',
  },
  distributable: {
    url: 'git+https://github.com/SpectralOps/teller.git',
    // pkgx pins the git checkout to the release tag (`ref: ${{version.tag}}`).
    // The buildkit reads `distributable.ref`, so carry it back to build the
    // requested version instead of the default-branch HEAD. Without this the
    // clone lands on `main` (a teller v2 Rust tree) while the go-build step
    // for <2 fails — and the source tarball 404s never resolve.
    ref: 'v{{version}}',
  } as Recipe['distributable'] & { ref: string },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'rust-lang.org': '^1.78',
    'protobuf.dev': '*', // as of 2.0.6
  },

  build: {
    script: [
      // teller <2 is a Go project; >=2 is a Rust (cargo) rewrite. The version
      // gates ensure only the matching toolchain step runs for a given tag.
      { run: 'go build $GO_ARGS -ldflags="$GO_LDFLAGS" .', if: '<2' },
      { run: 'cargo install --locked --path teller-cli --root {{prefix}}', if: '>=2' },
    ],
    env: {
      'COMMIT_SHA': '$(git describe --always --abbrev=8 --dirty)',
      'VERSION_DATE': '$(date -u +%FT%TZ)',
      'GO_ARGS': ['-trimpath', '-o={{prefix}}/bin/teller'],
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}', '-X main.commit=${COMMIT_SHA}', '-X main.date=${VERSION_DATE}'],
      'linux': {
        'GO_ARGS': ['-buildmode=pie'],
      },
    },
  },
}
