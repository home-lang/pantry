import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'karabiner-elements.pqrs.org',
  name: 'Karabiner-Elements',
  description: 'A powerful keyboard customizer for macOS.',
  homepage: 'https://karabiner-elements.pqrs.org',
  github: 'https://github.com/pqrs-org/Karabiner-Elements',
  programs: ['karabiner'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'pqrs-org/Karabiner-Elements',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'curl -fSL "https://github.com/pqrs-org/Karabiner-Elements/releases/download/v{{version}}/Karabiner-Elements-{{version}}.dmg" -o /tmp/karabiner.dmg',
    'hdiutil attach /tmp/karabiner.dmg -mountpoint /tmp/karabiner-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/karabiner-mount/Karabiner-Elements.app" "{{prefix}}/Karabiner-Elements.app" 2>/dev/null || \\',
    '  find /tmp/karabiner-mount -name "*.app" -maxdepth 1 -exec cp -R {} "{{prefix}}/" \\;',
    'hdiutil detach /tmp/karabiner-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'find "{{prefix}}" -name karabiner_cli -type f | head -1 | xargs -I{} ln -sf {} "{{prefix}}/bin/karabiner"',
    ],
  },
}
