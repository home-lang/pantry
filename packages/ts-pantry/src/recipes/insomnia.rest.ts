import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'insomnia.rest',
  name: 'Insomnia',
  description: 'A collaborative API client and design tool.',
  homepage: 'https://insomnia.rest',
  github: 'https://github.com/Kong/insomnia',
  programs: ['insomnia'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],
  versionSource: {
    type: 'github-releases',
    repo: 'Kong/insomnia',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'curl -fSL -L "https://github.com/Kong/insomnia/releases/download/core%40{{version}}/Insomnia.Core-{{version}}.dmg" -o /tmp/insomnia.dmg',
    'hdiutil attach /tmp/insomnia.dmg -mountpoint /tmp/insomnia-mount -nobrowse -noverify -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/insomnia-mount/Insomnia.app" "{{prefix}}/Insomnia.app"',
    'hdiutil detach /tmp/insomnia-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Insomnia.app/Contents/MacOS/Insomnia" "{{prefix}}/bin/insomnia"',
    ],
  },
}
