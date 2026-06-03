import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/kamal-deploy.org',
  domain: 'kamal-deploy.org',
  name: 'kamal-deploy',
  description: 'Deploy web apps anywhere — from bare metal to cloud VMs — using Docker with zero downtime',
  github: 'https://github.com/basecamp/kamal',
  programs: ['kamal'],
  versionSource: {
    type: 'github-releases',
    repo: 'basecamp/kamal',
  },
  distributable: {
    url: 'https://github.com/basecamp/kamal/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'ruby-lang.org': '>=3.1',
    'rubygems.org': '*',
  },
  buildDependencies: {
    'rubygems.org': '*',
  },

  build: {
    env: {
      GEM_HOME: '${{prefix}}',
      GEM_PATH: '${{prefix}}',
    },
    script: [
      'gem build kamal.gemspec',
      [
        'gem install',
        '--no-user-install',
        '--bindir={{prefix}}/gems/bin',
        '--no-document',
        'kamal-{{version}}.gem',
        'minitest',
        'drb',
        'base64',
        'bigdecimal',
        'logger',
        'ostruct',
      ].join(' '),
      'install -Dm755 $SRCROOT/props/kamal {{prefix}}/bin/kamal',
    ],
  },
}
