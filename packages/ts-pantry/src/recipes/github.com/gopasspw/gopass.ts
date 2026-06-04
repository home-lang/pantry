import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/gopasspw/gopass',
  name: 'gopass',
  programs: [
    'gopass',
  ],
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'rm -rf ./gopass.tar.gz ./extracted ./bin',
      'curl -Lfo gopass.tar.gz "https://github.com/gopasspw/gopass/releases/download/v{{version}}/gopass-{{version}}-$PLATFORM.tar.gz"',
      'mkdir ./extracted && tar -xf gopass.tar.gz -C ./extracted',
      // Install into the package prefix — extracting to ./bin left the install dir
      // empty ("Build produced no files").
      'mkdir -p {{prefix}}/bin && mv ./extracted/gopass {{prefix}}/bin/ && chmod +x {{prefix}}/bin/gopass',
      'rm -rf ./gopass.tar.gz ./extracted',
    ],
    env: {
      'darwin/aarch64': {
        PLATFORM: 'darwin-arm64',
      },
      'darwin/x86-64': {
        PLATFORM: 'darwin-amd64',
      },
      'linux/aarch64': {
        PLATFORM: 'linux-arm64',
      },
      'linux/x86-64': {
        PLATFORM: 'linux-amd64',
      },
    },
  },
  test: {
    script: [
      '[[ "$(gopass --version)" == *{{version}}* ]]',
    ],
  },
}
