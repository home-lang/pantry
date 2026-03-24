import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'craft-native.org',
  name: 'craft',
  description: 'Build desktop apps with web languages, powered by Zig',
  homepage: 'https://craft-native.org',
  github: 'https://github.com/home-lang/craft',
  programs: ['craft'],
  versionSource: {
    type: 'github-releases',
    repo: 'home-lang/craft',
    tagPattern: /^v(.+)$/,
  },

  // Craft publishes pre-built binaries via `pantry publish` (npm-style).
  // The Zig CLI resolves from packages/pantry/{name}/ on S3.
  // No build script needed — the binary is published by craft's release workflow.
  build: {
    script: [
      'echo "craft is published via pantry publish — no build needed"',
    ],
  },
}
