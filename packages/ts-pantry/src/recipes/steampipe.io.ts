import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'steampipe.io',
  name: 'steampipe',
  description: 'Zero-ETL, infinite possibilities. Live query APIs, code & more with SQL. No DB required.',
  homepage: 'https://steampipe.io/',
  github: 'https://github.com/turbot/steampipe',
  programs: ['steampipe'],
  versionSource: {
    type: 'github-releases',
    repo: 'turbot/steampipe',
  },
  distributable: {
    url: 'git+https://github.com/turbot/steampipe.git',
    // Pin the git checkout to the release tag. Without this the shallow clone
    // lands on the default branch (no tag), so `goreleaser build` (used for
    // >=2.1) can't derive {{.Version}} and aborts, and the <2.1 `go build`
    // path would compile main HEAD instead of the released version.
    ref: 'v{{version}}',
  } as Recipe['distributable'] & { ref: string },
  buildDependencies: {
    'go.dev': '^1.24',
    'goreleaser.com': '*',
    'git-scm.org': '2',
  },

  build: {
    script: [
      'go mod download',
      {
        run: 'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/steampipe\' .',
        if: '<2.1',
      },
      {
        run: [
          'GORELEASER_CURRENT_TAG="v{{version}}" goreleaser build --clean --single-target --skip=validate',
          'install -Dm755 "dist/steampipe_${PLATFORM}/steampipe" "{{prefix}}"/bin/steampipe',
        ],
        if: '>=2.1',
      },
    ],
    env: {
      // as of v2.1.0
      'darwin/aarch64': { PLATFORM: 'darwin_arm64_v8.0', GOARCH: 'arm64', GOOS: 'darwin' },
      'darwin/x86-64': { PLATFORM: 'darwin_amd64_v1', GOARCH: 'amd64', GOOS: 'darwin' },
      'linux/aarch64': { PLATFORM: 'linux_arm64_v8.0', GOARCH: 'arm64', GOOS: 'linux' },
      'linux/x86-64': { PLATFORM: 'linux_amd64_v1', GOARCH: 'amd64', GOOS: 'linux' },
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/turbot/steampipe/pkg/version.steampipeVersion={{version}}'],
      // linux: or segmentation fault
      // fix found here https://github.com/docker-library/golang/issues/402#issuecomment-982204575
      'linux': { GO_LDFLAGS: ['-buildmode=pie'] },
    },
  },
}
