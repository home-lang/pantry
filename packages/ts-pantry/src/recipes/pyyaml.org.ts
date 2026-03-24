import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pyyaml.org',
  name: 'pyyaml',
  description: 'Canonical source repository for LibYAML',
  homepage: 'http://pyyaml.org/wiki/LibYAML',
  github: 'https://github.com/yaml/libyaml',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'yaml/libyaml/tags',
  },
  distributable: {
    url: 'https://pyyaml.org/download/libyaml/yaml-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
  },
}
