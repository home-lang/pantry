import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mop-tracker/mop',
  propsDir: '../../props/github.com/mop-tracker/mop',
  name: 'mop',
  programs: [
    'mop',
  ],
  buildDependencies: {
    'go.dev': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://github.com/mop-tracker/mop/archive/refs/heads/master.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'patch -p1 < props/add-version-flag.patch ',
      'go mod download',
      'go build -ldflags="$LDFLAGS" -x -o ./bin/mop $PACKAGE',
      'mkdir -p "{{ prefix }}"/bin',
      'mv ./bin/mop "{{ prefix }}"/bin',
      'chmod +rx "{{ prefix }}"/bin/mop ',
    ],
    env: {
      LDFLAGS: '-X main.version={{version}}',
      PACKAGE: './cmd/mop',
    },
  },
  test: {
    script: [
      'test "$(mop --version)" = "mop-{{version}}"',
    ],
  },
}
