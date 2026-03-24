import type { RecipeDefinition } from '../../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'github.com/desktop',
  name: 'GitHub Desktop',
  description: 'A desktop application for contributing to projects on GitHub.',
  homepage: 'https://desktop.github.com',
  programs: ['github-desktop'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL -L "https://central.github.com/deployments/desktop/desktop/latest/darwin-arm64" -o /tmp/ghdesktop.zip',
      'cd /tmp && unzip -qo ghdesktop.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/GitHub Desktop.app" "{{prefix}}/GitHub Desktop.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../GitHub Desktop.app/Contents/MacOS/GitHub Desktop" "{{prefix}}/bin/github-desktop"',
    ],
  },
}
