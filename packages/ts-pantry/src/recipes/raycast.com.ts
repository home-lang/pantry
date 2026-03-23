import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'raycast.com',
  name: 'Raycast',
  description: 'A blazingly fast launcher and productivity tool for macOS.',
  homepage: 'https://raycast.com',
  programs: ['raycast'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
    'curl -fSL "https://releases.raycast.com/releases/{{version}}/download?arch=arm64" -o /tmp/raycast.dmg',
    'hdiutil attach /tmp/raycast.dmg -mountpoint /tmp/raycast-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/raycast-mount/Raycast.app" "{{prefix}}/Raycast.app"',
    'hdiutil detach /tmp/raycast-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Raycast.app/Contents/MacOS/Raycast" "{{prefix}}/bin/raycast"',
    ],
  },
}
