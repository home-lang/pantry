import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'firefox.org',
  name: 'Firefox',
  description: 'A free and open-source web browser.',
  homepage: 'https://www.mozilla.org/firefox',
  programs: ['firefox'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL "https://download.mozilla.org/?product=firefox-{{version}}-ssl&os=osx&lang=en-US" -o /tmp/firefox.dmg',
      'hdiutil attach /tmp/firefox.dmg -mountpoint /tmp/firefox-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/firefox-mount/Firefox.app" "{{prefix}}/Firefox.app"',
      'hdiutil detach /tmp/firefox-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Firefox.app/Contents/MacOS/firefox" "{{prefix}}/bin/firefox"',
    ],
  },
}
