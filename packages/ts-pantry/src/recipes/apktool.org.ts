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
  distributable: null,
  dependencies: {
    'openjdk.org': '^21',
  },

  build: {
    skip: ['verify-foreign-artifact'],
    script: [
      'curl --fail --location --retry 3 --retry-delay 2 --connect-timeout 15 --max-time 600 -o apktool.jar https://github.com/iBotPeaches/Apktool/releases/download/v{{version}}/apktool_{{version}}.jar',
      {
        run: 'mkdir -p bin libexec/lib',
        'working-directory': '${{prefix}}',
      },
      'install -m644 apktool.jar {{prefix}}/libexec/lib/apktool.org-{{version}}.jar',
      {
        run: [
          'echo \'#!/bin/sh\' > apktool',
          'echo \'exec java -jar "$(dirname "$0")/../libexec/lib/apktool.org-{{version}}.jar" "$@"\' >> apktool',
          'chmod +x apktool',
        ],
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
  test: {
    script: [
      'test -x "$(command -v apktool)"',
      'test -f "{{prefix}}/libexec/lib/apktool.org-{{version}}.jar"',
    ],
  },
}
