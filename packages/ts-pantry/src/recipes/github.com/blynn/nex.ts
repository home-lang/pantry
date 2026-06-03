import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/blynn/nex',
  name: 'nex',
  programs: [
    'nex',
  ],
  buildDependencies: {
    'rsync.samba.org': '*',
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/blynn/nex/archive/1a3320dab988372f8910ccc838a6a7a45c8980ff.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o {{prefix}}/bin/nex ./main.go ./nex.go',
      'rsync -avH ./test {{prefix}}',
      'rsync -avH ./props/README.md {{prefix}}/share/',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'nex -r -s {{prefix}}/test/lc.nex < {{prefix}}/share/README.md',
    ],
  },
}
