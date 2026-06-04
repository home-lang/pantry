import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'micro-editor.github.io',
  name: 'micro',
  description: 'A modern and intuitive terminal-based text editor',
  homepage: 'https://micro-editor.github.io',
  github: 'https://github.com/zyedidia/micro',
  programs: ['micro'],
  buildDependencies: {
    'go.dev': '^1.16',
  },
  versionSource: {
    type: 'github-releases',
    repo: 'zyedidia/micro',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/zyedidia/micro/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'mkdir -p "{{ prefix }}"/bin "{{ prefix }}"/share/man/man1',
      'go build -trimpath -ldflags "$LDFLAGS -X \'github.com/zyedidia/micro/v2/internal/util.CompileDate=$(go run tools/build-date.go)\'" ./cmd/micro',
      'install -m755 micro "{{ prefix }}"/bin',
      'cp assets/packaging/micro.1 "{{ prefix }}"/share/man/man1',
    ],
    env: {
      GOOS: '$(go env GOHOSTOS)',
      GOARCH: '$(go env GOHOSTARCH)',
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/zyedidia/micro/v2/internal/util.Version={{ version }}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'micro -version | grep {{ version }}',
    ],
  },
}
