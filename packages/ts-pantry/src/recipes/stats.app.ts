import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'stats.app',
  name: 'Stats',
  description: 'System monitor in the menu bar',
  homepage: 'https://github.com/exelban/stats',
  github: 'https://github.com/exelban/stats',
  programs: ['stats'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  versionSource: {
    type: 'github-releases',
    repo: 'exelban/stats',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'curl -fSL -L "https://github.com/exelban/stats/releases/download/v{{version}}/Stats.dmg" -o /tmp/stats.dmg',
      'hdiutil attach /tmp/stats.dmg -mountpoint /tmp/stats-mount -nobrowse -noverify -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/stats-mount/Stats.app" "{{prefix}}/Stats.app"',
      'hdiutil detach /tmp/stats-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Stats.app/Contents/MacOS/Stats" "{{prefix}}/bin/stats"',
    ],
  },

  test: {
    script: ['test -d "{{prefix}}/Stats.app"'],
  },
}
