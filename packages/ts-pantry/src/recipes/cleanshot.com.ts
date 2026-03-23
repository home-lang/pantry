import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cleanshot.com',
  name: 'CleanShot X',
  description: 'A screen capture and recording tool for macOS.',
  homepage: 'https://cleanshot.com',
  programs: ['cleanshot'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
    'curl -fSL "https://updates.getcleanshot.com/v3/CleanShot-X-{{version}}.dmg" -o /tmp/cleanshot.dmg',
    'hdiutil attach /tmp/cleanshot.dmg -mountpoint /tmp/cleanshot-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/cleanshot-mount/CleanShot X.app" "{{prefix}}/CleanShot X.app"',
    'hdiutil detach /tmp/cleanshot-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../CleanShot X.app/Contents/MacOS/CleanShot X" "{{prefix}}/bin/cleanshot"',
    ],
  },
}
