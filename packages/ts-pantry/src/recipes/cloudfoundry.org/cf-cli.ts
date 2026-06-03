import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cloudfoundry.org/cf-cli',
  name: 'cf-cli',
  programs: [
    'cf',
  ],
  buildDependencies: {
    'cmake.org': '^3',
    'go.dev': '=1.23.1',
  },
  distributable: {
    url: 'https://github.com/cloudfoundry/cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'make out/cf-cli_${PLATFORM}',
      'install out/cf-cli_${PLATFORM} {{prefix}}/bin/cf',
    ],
    env: {
      'darwin/aarch64': {
        PLATFORM: 'macosarm',
      },
      'darwin/x86-64': {
        PLATFORM: 'osx',
      },
      'linux/aarch64': {
        PLATFORM: 'linux_arm64',
      },
      'linux/x86-64': {
        PLATFORM: 'linux_x86-64',
      },
      CF_BUILD_VERSION: '${{version}}',
    },
  },
}
