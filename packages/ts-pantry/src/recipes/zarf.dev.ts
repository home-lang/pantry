import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
    script: [
      'make CLI_VERSION=v{{version}} build-cli-${PLATFORM}',
      'mkdir -p {{prefix}}/bin',
      'chmod +x build/$BIN',
      'mv build/$BIN \'{{prefix}}\'/bin/zarf',
    ],
    skip: ['fix-patchelf'],
  },
}
