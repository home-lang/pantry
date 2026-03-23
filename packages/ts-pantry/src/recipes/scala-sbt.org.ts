import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'scala-sbt.org',
  name: 'sbt',
  description: 'sbt, the interactive build tool',
  homepage: 'https://www.scala-sbt.org/',
  github: 'https://github.com/sbt/sbt',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'sbt/sbt',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/sbt/sbt/releases/download/v{{version}}/sbt-{{version}}.tgz',
    stripComponents: 1,
  },

  build: {
    script: [
      'sed \\'s,/etc/sbt/,\\$(pwd)/../etc/,g\\' bin/sbt > bin/sbt.tmp',
      'mv bin/sbt.tmp bin/sbt',
      'mkdir -p {{prefix}}/bin {{prefix}}/etc',
      'run: install sbt sbt-launch.jar {{prefix}}/bin/',
      'sbt --sbt-create about | grep {{version}}',
    ],
  },
}
