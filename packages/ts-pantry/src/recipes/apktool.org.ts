import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apktool.org',
  name: 'apktool',
  description: 'Tool for reverse engineering 3rd party, closed, binary Android apps',
  homepage: 'https://apktool.org/',
  github: 'https://github.com/iBotPeaches/Apktool',
  programs: ['apktool'],
  versionSource: {
    type: 'github-releases',
    repo: 'iBotPeaches/Apktool',
  },
  distributable: {
    url: 'https://github.com/iBotPeaches/Apktool/releases/download/v{{version}}/apktool_{{version}}.jar',
  },
  dependencies: {
    'openjdk.org': '^21',
  },

  build: {
    script: [
      'cd "${{prefix}}"',
      'mkdir -p bin libexec/lib',
      'cp apktool.org-{{version}}.jar {{prefix}}/libexec/lib/',
      'cd "${{prefix}}/bin"',
      'echo \'#!/bin/sh\' > apktool',
      'echo \'java -jar $(dirname $0)/../libexec/lib/apktool.org-{{version}}.jar "$@"\' >> apktool',
      'chmod +x apktool',
      '',
    ],
  },
}
