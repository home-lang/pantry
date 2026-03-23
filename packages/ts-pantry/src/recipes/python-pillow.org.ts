import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'python-pillow.org',
  name: 'python-pillow',
  description: 'Python Imaging Library (Fork)',
  homepage: 'https://python-pillow.github.io',
  github: 'https://github.com/python-pillow/Pillow',
  programs: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'python-pillow/Pillow',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/python-pillow/Pillow/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'curl -L \\'https://pkgx.dev/banner.png\\' -o test.png',
      'run: python $FIXTURE | grep \\'PNG (1959, 520)\\'',
    ],
  },
}
