import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Zouuup/landrun',
  name: 'landrun',
  programs: [
    'landrun',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/Zouuup/landrun/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -ldflags "$LDFLAGS" -o {{prefix}}/bin/landrun ./cmd/landrun',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-buildmode=pie',
      ],
    },
  },
  test: {
    script: [
      'if landrun true; then exit 1; fi',
      'if landrun --rox $PKGX_DIR/ $(command -v ls) /etc; then exit 1; fi',
      'if landrun --rox $PKGX_DIR/ $(command -v touch) $PWD/landrun_should_fail; then exit 1; fi',
      'landrun $LANDRUN_FLAGS --rox / $(command -v ls) $PWD',
      'landrun $LANDRUN_FLAGS --rox / --rw $PWD $(command -v touch) $PWD/landrun_rw',
      'landrun $LANDRUN_FLAGS --rox / $(command -v cat) $PWD/landrun_rw',
    ],
  },
}
