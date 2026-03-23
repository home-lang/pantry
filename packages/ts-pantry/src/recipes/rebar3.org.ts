import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'rebar3.org',
  name: 'rebar3',
  description: 'Erlang build tool that makes it easy to compile and test Erlang applications and releases.',
  homepage: 'https://rebar3.org',
  github: 'https://github.com/erlang/rebar3',
  programs: ['rebar3'],
  versionSource: {
    type: 'github-releases',
    repo: 'erlang/rebar3',
  },
  dependencies: {
    'erlang.org': '*',
  },

  build: {
    script: [
      'mkdir -p "{{prefix}}/bin"',
      'curl -fSL -o "{{prefix}}/bin/rebar3" "https://github.com/erlang/rebar3/releases/download/{{version}}/rebar3"',
      'chmod +x "{{prefix}}/bin/rebar3"',
    ],
  },
}
