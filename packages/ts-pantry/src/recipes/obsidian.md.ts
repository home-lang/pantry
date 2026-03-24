import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'obsidian.md',
  name: 'Obsidian',
  description: 'A powerful knowledge base that works on local Markdown files.',
  homepage: 'https://obsidian.md',
  github: 'https://github.com/obsidianmd/obsidian-releases',
  programs: ['obsidian'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],
  versionSource: {
    type: 'github-releases',
    repo: 'obsidianmd/obsidian-releases',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'curl -fSL "https://github.com/obsidianmd/obsidian-releases/releases/download/v{{version}}/Obsidian-{{version}}-universal.dmg" -o /tmp/obsidian.dmg || curl -fSL "https://github.com/obsidianmd/obsidian-releases/releases/download/v{{version}}/Obsidian-{{version}}.dmg" -o /tmp/obsidian.dmg',
      'hdiutil attach /tmp/obsidian.dmg -mountpoint /tmp/obsidian-mount -nobrowse -noverify -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/obsidian-mount/Obsidian.app" "{{prefix}}/Obsidian.app"',
      'hdiutil detach /tmp/obsidian-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Obsidian.app/Contents/MacOS/Obsidian" "{{prefix}}/bin/obsidian"',
    ],
  },
}
