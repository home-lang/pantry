import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kevinburke/go-bindata',
  name: 'go-bindata',
  programs: [
    'go-bindata',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
    'gnu.org/patch': '*',
    'crates.io/semverator': '^0',
  },
  distributable: {
    url: 'https://github.com/kevinburke/go-bindata/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'patch -p1 <props/patch-go-modules.diff',
        if: '<3.25',
      },
      'mkdir -p {{prefix}}/bin',
      'go build -v -ldflags="$LDFLAGS" -o {{prefix}}/bin/go-bindata ./go-bindata',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X=main.Version={{version}}',
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
      'output=$(go-bindata -version)',
      'case $output in',
      '  *{{ version }}*)',
      '    echo "Version match"',
      '    ;;',
      '  *)',
      '    echo "Version mismatch"',
      '    ;;',
      'esac',
    ],
  },
}
