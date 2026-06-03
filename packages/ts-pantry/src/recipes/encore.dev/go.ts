import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'encore.dev/go',
  name: 'go',
  programs: [
    'encore-go',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'curl.se': '*',
    'gnu.org/tar': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'curl -L https://github.com/encoredev/go/releases/download/encore-go{{version}}/$TYPE.tar.gz | tar zxvf -',
      {
        run: 'cp -a $SRCROOT/encore-go/* .',
        'working-directory': '${{prefix}}',
      },
      {
        run: 'ln -s go encore-go',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      'linux/x86-64': {
        TYPE: 'linux_x86-64',
      },
      'linux/aarch64': {
        TYPE: 'linux_arm64',
      },
      'darwin/x86-64': {
        TYPE: 'macos_x86-64',
      },
      'darwin/aarch64': {
        TYPE: 'macos_arm64',
      },
    },
  },
  test: {
    script: [
      'mv $FIXTURE $FIXTURE.go',
      'OUTPUT=$(go run $FIXTURE.go)',
      'test "Hello World" = "$OUTPUT"',
    ],
  },
}
