import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kamal-deploy.org',
  name: 'kamal-deploy',
  description: 'Deploy web apps anywhere — from bare metal to cloud VMs — using Docker with zero downtime',
  programs: ['kamal'],
  distributable: {
    url: 'https://github.com/basecamp/kamal/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'gem build kamal.gemspec',
      'gem install',
      'install -Dm755 props/kamal "{{prefix}}"/bin/kamal',
    ],
  },
}
