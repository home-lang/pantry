import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'linear.app',
  name: 'Linear',
  description: 'A streamlined issue tracking and project management tool.',
  homepage: 'https://linear.app',
  programs: ['linear'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
    'curl -fSL -L "https://desktop.linear.app/mac/dmg/Linear-universal.dmg" -o /tmp/linear.dmg || curl -fSL -L "https://desktop.linear.app/mac/dmg" -o /tmp/linear.dmg',
    'hdiutil attach /tmp/linear.dmg -mountpoint /tmp/linear-mount -nobrowse -noverify -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/linear-mount/Linear.app" "{{prefix}}/Linear.app"',
    'hdiutil detach /tmp/linear-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Linear.app/Contents/MacOS/Linear" "{{prefix}}/bin/linear"',
    ],
  },
}
