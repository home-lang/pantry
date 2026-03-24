import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'handbrake.fr',
  name: 'HandBrake',
  description: 'An open-source video transcoder.',
  homepage: 'https://handbrake.fr',
  github: 'https://github.com/HandBrake/HandBrake',
  programs: ['handbrake'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],
  versionSource: {
    type: 'github-releases',
    repo: 'HandBrake/HandBrake',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'curl -fSL "https://github.com/HandBrake/HandBrake/releases/download/{{version}}/HandBrake-{{version}}.dmg" -o /tmp/handbrake.dmg',
      'hdiutil attach /tmp/handbrake.dmg -mountpoint /tmp/handbrake-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/handbrake-mount/HandBrake.app" "{{prefix}}/HandBrake.app"',
      'hdiutil detach /tmp/handbrake-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../HandBrake.app/Contents/MacOS/HandBrake" "{{prefix}}/bin/handbrake"',
    ],
  },
}
