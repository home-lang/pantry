import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/sindresorhus/macos-term-size",
  name: "macos-term-size",
  programs: [
    "term-size",
  ],
  distributable: {
    url: "https://github.com/sindresorhus/macos-term-size/releases/download/v{{version}}/term-size.zip",
    stripComponents: 1,
  },
  build: {
    script: [
      "mkdir -p {{prefix}}/bin",
      {
        run: "CODESIGN=\"$(codesign -dvv term-size 2>&1)\"\necho $CODESIGN | grep \"Authority=$AUTHORITY\"\necho $CODESIGN | grep \"TeamIdentifier=$TEAMIDENTIFIER\"\n",
      },
      "install term-size {{prefix}}/bin",
    ],
    env: {
      AUTHORITY: "Developer ID Application: Node.js Foundation (HX7739G8FX)",
      TEAMIDENTIFIER: "HX7739G8FX",
    },
  },
}
