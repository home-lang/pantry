import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'spotify.com',
  name: 'Spotify',
  description: 'A digital music streaming service.',
  homepage: 'https://spotify.com',
  programs: ['spotify'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL "https://download.scdn.co/SpotifyARM64.dmg" -o /tmp/spotify.dmg',
      'hdiutil attach /tmp/spotify.dmg -mountpoint /tmp/spotify-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/spotify-mount/Spotify.app" "{{prefix}}/Spotify.app"',
      'hdiutil detach /tmp/spotify-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Spotify.app/Contents/MacOS/Spotify" "{{prefix}}/bin/spotify"',
    ],
  },
}
