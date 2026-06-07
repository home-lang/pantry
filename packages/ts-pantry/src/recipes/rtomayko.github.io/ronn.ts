import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: '../props/rtomayko.github.io/ronn',
  domain: 'rtomayko.github.io/ronn',
  name: 'ronn',
  programs: [
    'ronn',
  ],
  dependencies: {
    'ruby-lang.org': '^3.1',
    'rubygems.org': '*',
  },
  buildDependencies: {
    'rubygems.org': '*',
  },
  distributable: {
    url: 'https://github.com/rtomayko/ronn/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'gem build ronn.gemspec',
      'gem install \\',
      '  --no-user-install \\',
      '  --bindir={{prefix}}/gems/bin \\',
      '  --no-document \\',
      '  ronn-{{version}}.gem',
      'mkdir {{prefix}}/bin',
      'mv props/ronn {{prefix}}/bin',
    ],
    env: {
      GEM_HOME: '${{prefix}}',
      GEM_PATH: '${{prefix}}',
    },
  },
  test: {
    script: [
      'printf \'simple(7) -- a simple ronn example\\n==================================\\nThis document is created by ronn.\\n\' > fixture.ronn',
      'ronn --date 1970-01-01 fixture.ronn',
    ],
  },
}
