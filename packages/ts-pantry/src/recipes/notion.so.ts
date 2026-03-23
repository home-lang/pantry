import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'notion.so',
  name: 'Notion',
  description: 'An all-in-one workspace for notes, tasks, wikis, and databases.',
  homepage: 'https://notion.so',
  programs: ['notion'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'if test "{{hw.arch}}" = "aarch64"; then ARCH="arm64"; else ARCH="x64"; fi',
      'curl -fSL "https://desktop-release.notion-static.com/Notion-{{version}}-${ARCH}.dmg" -o /tmp/notion.dmg',
      'hdiutil attach /tmp/notion.dmg -mountpoint /tmp/notion-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/notion-mount/Notion.app" "{{prefix}}/Notion.app"',
      'hdiutil detach /tmp/notion-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Notion.app/Contents/MacOS/Notion" "{{prefix}}/bin/notion"',
    ],
  },
}
