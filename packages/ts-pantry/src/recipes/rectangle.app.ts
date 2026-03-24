import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rectangle.app',
  name: 'Rectangle',
  description: 'A window management app for macOS based on Spectacle.',
  homepage: 'https://rectangleapp.com',
  github: 'https://github.com/rxhanson/Rectangle',
  programs: ['rectangle'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'rxhanson/Rectangle',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'curl -fSL "https://github.com/rxhanson/Rectangle/releases/download/v{{version}}/Rectangle{{version}}.dmg" -o /tmp/rectangle.dmg',
      'hdiutil attach /tmp/rectangle.dmg -mountpoint /tmp/rectangle-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/rectangle-mount/Rectangle.app" "{{prefix}}/Rectangle.app"',
      'hdiutil detach /tmp/rectangle-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Rectangle.app/Contents/MacOS/Rectangle" "{{prefix}}/bin/rectangle"',
    ],
  },
}
