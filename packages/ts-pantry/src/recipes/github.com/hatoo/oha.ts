import type { Recipe } from '../../../../scripts/recipe-types'
import { githubAssetBuildDependencies, githubAssetSteps } from '../../../../scripts/github-asset-recipe'

export const recipe: Recipe = {
  domain: 'github.com/hatoo/oha',
  name: 'oha',
  description: 'Native HTTP load generator with paced requests and JSON reports.',
  homepage: 'https://github.com/hatoo/oha',
  github: 'https://github.com/hatoo/oha',
  programs: ['oha'],
  platforms: ['linux/x86-64'],
  versionSource: { type: 'github-releases', repo: 'hatoo/oha', tagPattern: /^v(.+)$/, stable: true },
  distributable: null,
  buildDependencies: githubAssetBuildDependencies,
  build: {
    script: [
      ...githubAssetSteps('hatoo/oha', 'v{{version}}', 'oha-linux-amd64', 'oha'),
      'install -Dm755 oha "{{prefix}}/bin/oha"',
    ],
  },
  test: { required: true, script: ['oha --version | grep -F "{{version}}"'] },
}
