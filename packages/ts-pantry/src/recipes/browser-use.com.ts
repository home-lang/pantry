import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'browser-use.com',
  name: 'browser-use',
  description: 'Make websites accessible for AI agents',
  homepage: 'https://browser-use.com/',
  github: 'https://github.com/browser-use/browser-use',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'browser-use/browser-use',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/browser-use/browser-use/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'python -m pip install --prefix={{prefix}} . playwright $ADDITIONAL_PACKAGES',
      'run: \\python -m pip install --no-deps --force-reinstall --no-cache-dir -v --no-binary :all: --prefix={{prefix}} jiter rpds-py\\',
    ],
  },
}
