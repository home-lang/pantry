import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'alttab.app',
  name: 'AltTab',
  description: 'A window switcher for macOS that brings the power of alt-tab from Windows.',
  homepage: 'https://alt-tab-macos.netlify.app',
  github: 'https://github.com/lwouis/alt-tab-macos',
  programs: ['alttab'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'lwouis/alt-tab-macos',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'curl -fSL "https://github.com/lwouis/alt-tab-macos/releases/download/v{{version}}/AltTab-{{version}}.zip" -o /tmp/alttab.zip',
      'cd /tmp && unzip -qo alttab.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/AltTab.app" "{{prefix}}/AltTab.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../AltTab.app/Contents/MacOS/AltTab" "{{prefix}}/bin/alttab"',
    ],
  },
}
