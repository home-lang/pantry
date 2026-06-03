import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ZZROTDesign/docker-clean',
  name: 'docker-clean',
  programs: [
    'docker-clean',
  ],
  dependencies: {
    'gnu.org/bash': '*',
    'docker.com/cli': '*',
  },
  distributable: {
    url: 'https://github.com/ZZROTDesign/docker-clean/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p "{{ prefix }}"/bin',
      'cp docker-clean {{prefix}}/bin',
    ],
  },
  test: {
    script: [
      'test "$(docker-clean --version)" = "{{version}}"',
    ],
  },
}
