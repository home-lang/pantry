import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'kamal-deploy.org',
  name: 'kamal-deploy',
  description: '',
  programs: ['', '', '', '', '', '', '', ''],
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
