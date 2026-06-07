import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/sindresorhus/macos-term-size',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'macos-term-size',
  programs: [
    'term-size',
  ],
  distributable: {
    // v1.0.0 ships a flat zip containing a single `terminal-size` binary (no
    // top-level dir), so strip-components must be 0. Older releases (<=0.2.0)
    // shipped `term-size.zip`/`term-size`; the latest version is what builds.
    url: 'https://github.com/sindresorhus/macos-term-size/releases/download/v{{version}}/terminal-size.zip',
    stripComponents: 0,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      // The extracted binary is named `terminal-size` (older releases named it
      // `term-size`); normalize to a single BIN var so codesign + install work
      // regardless of which asset/version was downloaded.
      {
        run: [
          'if [ -f terminal-size ]; then BIN=terminal-size; else BIN=term-size; fi',
          'CODESIGN="$(codesign -dvv "$BIN" 2>&1)"',
          'echo "$CODESIGN" | grep "Authority=$AUTHORITY"',
          'echo "$CODESIGN" | grep "TeamIdentifier=$TEAMIDENTIFIER"',
          'install "$BIN" {{prefix}}/bin/term-size',
        ],
      },
    ],
    env: {
      AUTHORITY: 'Developer ID Application: Node.js Foundation (HX7739G8FX)',
      TEAMIDENTIFIER: 'HX7739G8FX',
    },
  },
}
