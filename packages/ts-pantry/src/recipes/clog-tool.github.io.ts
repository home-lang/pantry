import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'clog-tool.github.io',
  name: 'clog',
  description: 'Colorized pattern-matching log tail utility',
  homepage: 'https://gothenburgbitfactory.org/clog/docs/',
  github: 'https://github.com/GothenburgBitFactory/clog',
  programs: ['clog'],
  versionSource: {
    type: 'github-releases',
    repo: 'GothenburgBitFactory/clog',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/clog-tool/clog-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
      'test "$(clog --version)" = "clog {{version}}"',
    ],
  },
}
