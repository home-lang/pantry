import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jenv.be',
  name: 'jenv',
  description: 'Manage your Java environment ',
  homepage: 'https://www.jenv.be',
  github: 'https://github.com/jenv/jenv',
  programs: ['jenv'],
  versionSource: {
    type: 'github-releases',
    repo: 'jenv/jenv',
  },
  distributable: {
    url: 'https://github.com/jenv/jenv/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'mkdir -p "{{prefix}}"',
      'mv bin libexec fish available-plugins "{{prefix}}"',
    ],
  },
}
