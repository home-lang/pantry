import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'beyondgrep.com',
  name: 'ack',
  description: 'ack is a grep-like search tool optimized for source code.',
  homepage: 'https://beyondgrep.com/',
  github: 'https://github.com/beyondgrep/ack3',
  programs: ['ack'],
  versionSource: {
    type: 'github-releases',
    repo: 'beyondgrep/ack3/tags',
  },
  dependencies: {
    'perl.org': '*',
  },

  build: {
    script: [
      'mkdir -p "{{prefix}}/bin"',
      'env -i PATH="/usr/bin:/bin:/usr/sbin:/sbin" HOME="$HOME" curl -fSL -o "{{prefix}}/bin/ack" "https://beyondgrep.com/ack-v{{version}}"',
      'chmod +x "{{prefix}}/bin/ack"',
    ],
  },
}
