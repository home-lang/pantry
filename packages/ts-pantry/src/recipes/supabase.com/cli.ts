import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'supabase.com/cli',
  name: 'cli',
  programs: [
    'supabase',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/supabase/cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cd apps/cli-go',
        if: '>=2.99',
      },
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS"',
      'mkdir -p "{{ prefix }}"/bin',
      'mv cli "{{ prefix }}"/bin/supabase',
    ],
    env: {
      GO111MODULE: 'on',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X=main.Version={{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
