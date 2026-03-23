import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'bruno.app',
  name: 'Bruno',
  description: 'A fast and Git-friendly open-source API client.',
  homepage: 'https://usebruno.com',
  programs: ['bruno'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL -L "https://github.com/usebruno/bruno/releases/download/v{{version}}/bruno_{{version}}_arm64_mac.dmg" -o /tmp/bruno.dmg',
      'hdiutil attach /tmp/bruno.dmg -mountpoint /tmp/bruno-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/bruno-mount/Bruno.app" "{{prefix}}/Bruno.app"',
      'hdiutil detach /tmp/bruno-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Bruno.app/Contents/MacOS/Bruno" "{{prefix}}/bin/bruno"',
    ],
  },
}
