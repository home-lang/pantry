import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dbeaver.io',
  name: 'DBeaver',
  description: 'A universal database tool for developers and database administrators.',
  homepage: 'https://dbeaver.io',
  programs: ['dbeaver'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL -L "https://dbeaver.io/files/{{version}}/dbeaver-ce-{{version}}-macos-aarch64.dmg" -o /tmp/dbeaver.dmg',
      'hdiutil attach /tmp/dbeaver.dmg -mountpoint /tmp/dbeaver-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/dbeaver-mount/DBeaver.app" "{{prefix}}/DBeaver.app"',
      'hdiutil detach /tmp/dbeaver-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../DBeaver.app/Contents/MacOS/dbeaver" "{{prefix}}/bin/dbeaver"',
    ],
  },
}
