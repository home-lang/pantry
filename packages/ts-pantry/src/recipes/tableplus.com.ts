import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tableplus.com',
  name: 'TablePlus',
  description: 'A modern, native database management tool.',
  homepage: 'https://tableplus.com',
  programs: ['tableplus'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL "https://tableplus.com/release/osx/tableplus_latest" -o /tmp/tableplus.dmg',
      'hdiutil attach /tmp/tableplus.dmg -mountpoint /tmp/tableplus-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/tableplus-mount/TablePlus.app" "{{prefix}}/TablePlus.app"',
      'hdiutil detach /tmp/tableplus-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../TablePlus.app/Contents/MacOS/TablePlus" "{{prefix}}/bin/tableplus"',
    ],
  },
}
