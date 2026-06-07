import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/julienXX/terminal-notifier',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'terminal-notifier',
  programs: [
    'terminal-notifier',
  ],
  distributable: {
    url: 'https://github.com/julienXX/terminal-notifier/releases/download/{{version}}/terminal-notifier-{{version}}.zip',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}',
      'cp -a terminal-notifier.app {{prefix}}/',
      {
        run: 'cp $PROP terminal-notifier\nchmod +x terminal-notifier\n',
        'working-directory': '${{prefix}}/bin',
        prop: {
          content: [
            '#!/bin/bash',
            '$(dirname $0)/../terminal-notifier.app/Contents/MacOS/terminal-notifier $*',
          ],
        },
      },
    ],
  },
  test: {
    script: [
      'terminal-notifier -version | grep {{version}}',
    ],
  },
}
