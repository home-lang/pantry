import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/rubocop.org',
  domain: 'rubocop.org',
  name: 'rubocop',
  description: 'A Ruby static code analyzer and formatter, based on the community Ruby style guide.',
  homepage: 'https://docs.rubocop.org',
  github: 'https://github.com/rubocop/rubocop',
  programs: ['rubocop'],
  versionSource: {
    type: 'github-releases',
    repo: 'rubocop/rubocop',
  },
  distributable: {
    url: 'https://github.com/rubocop/rubocop/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'ruby-lang.org': '>=3.1<3.3.7',
    'rubygems.org': '*',
  },

  build: {
    script: [
      'gem build rubocop.gemspec',
      { run: 'EXTRA_GEMS="racc" # since 1.85.1', if: '>=1.85.1' },
      [
        'gem install',
        '--no-user-install',
        '--bindir={{prefix}}/gems/bin',
        '--no-document',
        'rubocop-{{version.raw}}.gem $EXTRA_GEMS',
      ].join(' '),
      'install -Dm755 props/rubocop "{{prefix}}"/bin/rubocop',
    ],
    env: {
      'GEM_HOME': '${{prefix}}',
      'GEM_PATH': '${{prefix}}',
    },
  },
}
