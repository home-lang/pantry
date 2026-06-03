import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pantsbuild.org/scie-pants',
  name: 'scie-pants',
  programs: [
    'pants',
  ],
  platforms: ['darwin/aarch64', 'linux'],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'curl -Lfo pants https://github.com/pantsbuild/scie-pants/releases/download/v{{version}}/scie-pants-$PLATFORM',
      'chmod u+x pants',
    ],
    env: {
      'darwin/aarch64': {
        PLATFORM: 'macos-aarch64',
      },
      'darwin/x86-64': {
        PLATFORM: 'macos-x86_64',
      },
      'linux/aarch64': {
        PLATFORM: 'linux-aarch64',
      },
      'linux/x86-64': {
        PLATFORM: 'linux-x86_64',
      },
    },
  },
  test: {
    script: [
      'cp $FIXTURE pants.toml',
      'test "$(pants --version)" = 2.17.1',
    ],
  },
}
