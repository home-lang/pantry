import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/julienXX/terminal-notifier",
  name: "terminal-notifier",
  programs: [
    "terminal-notifier",
  ],
  distributable: {
    url: "https://github.com/julienXX/terminal-notifier/releases/download/{{version}}/terminal-notifier-{{version}}.zip",
    stripComponents: 1,
  },
  build: {
    script: [
      "mkdir -p {{prefix}}",
      "cp -a terminal-notifier.app {{prefix}}/",
      {
        run: "cp $PROP terminal-notifier\nchmod +x terminal-notifier\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "terminal-notifier -version | grep {{version}}",
    ],
  },
}
