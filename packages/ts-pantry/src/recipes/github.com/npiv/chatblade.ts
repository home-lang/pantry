import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/npiv/chatblade',
  name: 'chatblade',
  programs: [
    'chatblade',
  ],
  dependencies: {
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://github.com/npiv/chatblade/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/chatblade',
    ],
  },
}
