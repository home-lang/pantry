import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ghostty.org',
  name: 'Ghostty',
  description: 'A fast, feature-rich, and cross-platform terminal emulator.',
  homepage: 'https://ghostty.org',
  github: 'https://github.com/ghostty-org/ghostty',
  programs: ['ghostty'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'ghostty-org/ghostty',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'curl -fSL "https://release.files.ghostty.org/{{version}}/Ghostty.dmg" -o /tmp/ghostty.dmg',
    'hdiutil attach /tmp/ghostty.dmg -mountpoint /tmp/ghostty-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/ghostty-mount/Ghostty.app" "{{prefix}}/Ghostty.app"',
    'hdiutil detach /tmp/ghostty-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Ghostty.app/Contents/MacOS/ghostty" "{{prefix}}/bin/ghostty"',
    ],
  },
}
