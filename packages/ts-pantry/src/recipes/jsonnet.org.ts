import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jsonnet.org',
  name: 'jsonnet',
  description: 'Jsonnet - The data templating language',
  homepage: 'http://jsonnet.org',
  github: 'https://github.com/google/jsonnet',
  programs: ['jsonnet', 'jsonnetfmt'],
  versionSource: {
    type: 'github-releases',
    repo: 'google/jsonnet',
  },
  distributable: {
    url: 'https://github.com/google/jsonnet/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'make --jobs={{hw.concurrency}}',
      'install -D jsonnet {{prefix}}/bin/jsonnet',
      'install -D jsonnetfmt {{prefix}}/bin/jsonnetfmt',
    ],
  },
}
