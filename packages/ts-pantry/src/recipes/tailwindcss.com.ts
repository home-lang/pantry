import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tailwindcss.com',
  name: 'tailwindcss',
  description: 'A utility-first CSS framework for rapid UI development.',
  homepage: 'https://tailwindcss.com',
  github: 'https://github.com/tailwindlabs/tailwindcss',
  programs: ['tailwindcss'],
  versionSource: {
    type: 'github-releases',
    repo: 'tailwindlabs/tailwindcss',
  },
  distributable: null,
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    workingDirectory: '{{prefix}}',
    script: [
      'curl -Lfo tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/download/v{{version}}/tailwindcss-$PLATFORM',
      'chmod +x tailwindcss',
      'mkdir -p bin',
      'mv tailwindcss bin',
    ],
    env: {
      'darwin/aarch64': { PLATFORM: 'macos-arm64' },
      'darwin/x86-64': { PLATFORM: 'macos-x64' },
      'linux/aarch64': { PLATFORM: 'linux-arm64' },
      'linux/x86-64': { PLATFORM: 'linux-x64' },
    },
    skip: ['fix-patchelf'],
  },
}
