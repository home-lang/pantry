import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'bun.sh',
  name: 'bun',
  description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one',
  homepage: 'https://bun.sh',
  github: 'https://github.com/oven-sh/bun',
  programs: ['bun', 'bunx'],
  versionSource: {
    type: 'github-releases',
    repo: 'oven-sh/bun',
    tagPattern: /\/^bun-\//,
  },
  buildDependencies: {
    'curl.se': '*',
    'info-zip.org/unzip': '*',
  },

  build: {
    script: [
      'curl -Lfo bun.zip "https://github.com/oven-sh/bun/releases/download/bun-v{{version}}/bun-$PLATFORM.zip"',
      'unzip -j bun.zip',
      'rm bun.zip',
      'ln -s bun bunx',
    ],
    skip: ['fix-patchelf'],
  },
}
