import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'slack.com',
  name: 'Slack',
  description: 'A messaging and collaboration platform for teams.',
  homepage: 'https://slack.com',
  programs: ['slack'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL "https://downloads.slack-edge.com/desktop-releases/mac/universal/{{version}}/Slack-{{version}}-macOS.dmg" -o /tmp/slack.dmg',
      'hdiutil attach /tmp/slack.dmg -mountpoint /tmp/slack-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/slack-mount/Slack.app" "{{prefix}}/Slack.app"',
      'hdiutil detach /tmp/slack-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Slack.app/Contents/MacOS/Slack" "{{prefix}}/bin/slack"',
    ],
  },
}
