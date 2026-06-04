import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kylef/swiftenv',
  name: 'swiftenv',
  programs: [
    'swiftenv',
  ],
  distributable: {
    url: 'https://github.com/kylef/swiftenv/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // swiftenv is a pure shell-script tool. bin/swiftenv resolves its
      // siblings (libexec, completions, share) relative to bin/, so install
      // those directories straight into {{prefix}} preserving the layout.
      'mkdir -p "{{prefix}}"',
      'cp -a "$SRCROOT"/bin "$SRCROOT"/libexec "$SRCROOT"/completions "$SRCROOT"/share "{{prefix}}/"',
    ],
  },
}
