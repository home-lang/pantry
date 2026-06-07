import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/gollum/gollum',
  name: 'gollum',
  programs: [
    'gollum',
  ],
  dependencies: {
    'ruby-lang.org': '^3.1',
    'rubygems.org': '~3.3',
  },
  buildDependencies: {
    'cmake.org': '^3', // needed by the rugged gem
  },
  distributable: {
    url: 'https://github.com/gollum/gollum/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'gem build gollum.gemspec',
      'gem install gollum-{{version}}.gem',
      {
        run: 'mv {{prefix}}/bin/* .\nfor tool in gollum*; do\n  cp $PROP {{prefix}}/bin/$tool\ndone\n',
        'working-directory': '${{prefix}}/gems/bin',
        prop: {
          content: [
            '#!/bin/sh',
            'export GEM_HOME="$(cd "$(dirname "$0")"/.. && pwd)"',
            'export GEM_PATH="$GEM_HOME"',
            'export PATH="$GEM_HOME/gems/bin:$PATH"',
            'exec "$GEM_HOME"/gems/bin/$(basename $0) "$@"',
          ],
        },
      },
      {
        run: 'rmdir plugins build_info',
        'working-directory': '${{prefix}}',
      },
    ],
    env: {
      GEM_HOME: '${{prefix}}',
      GEM_PATH: '${{prefix}}',
    },
  },
}
