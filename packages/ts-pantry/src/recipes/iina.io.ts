import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'iina.io',
  name: 'IINA',
  description: 'A modern media player for macOS.',
  homepage: 'https://iina.io',
  programs: ['iina'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL -L "https://github.com/iina/iina/releases/download/v{{version}}/IINA.v{{version}}.dmg" -o /tmp/iina.dmg',
      'hdiutil attach /tmp/iina.dmg -mountpoint /tmp/iina-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/iina-mount/IINA.app" "{{prefix}}/IINA.app"',
      'hdiutil detach /tmp/iina-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../IINA.app/Contents/MacOS/IINA" "{{prefix}}/bin/iina"',
    ],
  },
}
