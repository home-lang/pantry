import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'maccy.app',
  name: 'Maccy',
  description: 'A lightweight clipboard manager for macOS.',
  homepage: 'https://maccy.app',
  github: 'https://github.com/p0deje/Maccy',
  programs: ['maccy'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'p0deje/Maccy',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'curl -fSL "https://github.com/p0deje/Maccy/releases/download/{{version}}/Maccy.app.zip" -o /tmp/maccy.zip',
      'cd /tmp && unzip -qo maccy.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/Maccy.app" "{{prefix}}/Maccy.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Maccy.app/Contents/MacOS/Maccy" "{{prefix}}/bin/maccy"',
    ],
  },
}
