import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bashly.dannyb.co',
  name: 'bashly',
  description: 'Bash command line framework and CLI generator',
  homepage: 'https://bashly.dev',
  github: 'https://github.com/DannyBen/bashly',
  programs: ['bashly'],
  versionSource: {
    type: 'github-releases',
    repo: 'DannyBen/bashly',
  },
  distributable: {
    url: 'https://github.com/DannyBen/bashly/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'ruby-lang.org': '^3.1',
    'rubygems.org': '*',
  },
  buildDependencies: {
    'rubygems.org': '*',
  },

  build: {
    script: [
      'gem build bashly.gemspec',
      'gem install --no-user-install --bindir={{prefix}}/gems/bin --no-document bashly-{{version}}.gem rexml',
      {
        run: [
          'cat $PROP >bashly',
          'chmod +x bashly',
        ],
        'working-directory': '${{prefix}}/bin',
        prop: {
          content: [
            '#!/bin/sh',
            'export GEM_HOME="$(cd "$(dirname "$0")"/.. && pwd)"',
            'export GEM_PATH="$GEM_HOME"',
            'export PATH="$GEM_HOME/gems/bin:$PATH"',
            'exec "$GEM_HOME"/gems/bin/bashly "$@"',
            '',
          ].join('\n'),
        },
      },
    ],
    env: {
      'GEM_HOME': '${{prefix}}',
      'GEM_PATH': '${{prefix}}',
    },
  },
}
