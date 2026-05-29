import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zarf.dev',
  name: 'zarf',
  description: 'DevSecOps for Air Gap & Limited-Connection Systems. https://zarf.dev/',
  github: 'https://github.com/defenseunicorns/zarf',
  programs: ['zarf'],
  versionSource: {
    type: 'github-releases',
    repo: 'defenseunicorns/zarf',
  },
  distributable: {
    url: 'https://codeload.github.com/defenseunicorns/zarf/tar.gz/refs/tags/v{{version}}',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    env: {
      'darwin/aarch64': {
        PLATFORM: 'mac-apple',
        BIN: 'zarf-mac-apple',
      },
      'darwin/x86-64': {
        PLATFORM: 'mac-intel',
        BIN: 'zarf-mac-intel',
      },
      'linux/aarch64': {
        PLATFORM: 'linux-arm',
        BIN: 'zarf-arm',
      },
      'linux/x86-64': {
        PLATFORM: 'linux-amd',
        BIN: 'zarf',
      },
    },
    script: [
      'make CLI_VERSION=v{{version}} build-cli-${PLATFORM}',
      'mkdir -p {{prefix}}/bin',
      'chmod +x build/$BIN',
      'mv build/$BIN \'{{prefix}}\'/bin/zarf',
    ],
    skip: ['fix-patchelf'],
  },
}
