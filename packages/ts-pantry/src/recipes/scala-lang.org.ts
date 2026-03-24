import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'scala-lang.org',
  name: 'scala-lang',
  description: 'The Scala 3 compiler, also known as Dotty.',
  homepage: 'https://dotty.epfl.ch',
  github: 'https://github.com/scala/scala3',
  programs: ['scalac', 'scala', 'scala-cli', 'sbtn', 'amm'],
  versionSource: {
    type: 'github-releases',
    repo: 'scala/scala3',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/scala/scala3/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'curl -fLo coursier https://github.com/coursier/launchers/raw/master/coursier',
      'chmod +x coursier',
      './coursier setup --yes --install-dir {{prefix}}/bin',
      './coursier install scala:{{version}} scalac:{{version}} --install-dir {{prefix}}/bin',
      './coursier install scala-cli sbtn scalafmt --install-dir {{prefix}}/bin',
    ],
  },
}
