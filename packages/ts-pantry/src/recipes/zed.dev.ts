import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'zed.dev',
  name: 'Zed',
  description: 'A high-performance, multiplayer code editor.',
  homepage: 'https://zed.dev',
  github: 'https://github.com/zed-industries/zed',
  programs: ['zed'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],
  versionSource: {
    type: 'github-releases',
    repo: 'zed-industries/zed',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'curl -fSL "https://zed.dev/api/releases/stable/latest/Zed-aarch64.dmg" -o /tmp/zed.dmg',
    'hdiutil attach /tmp/zed.dmg -mountpoint /tmp/zed-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/zed-mount/Zed.app" "{{prefix}}/Zed.app"',
    'hdiutil detach /tmp/zed-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Zed.app/Contents/MacOS/cli" "{{prefix}}/bin/zed"',
    ],
  },
}
