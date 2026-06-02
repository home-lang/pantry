import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kkos/oniguruma',
  name: 'onig-config',
  description: 'Regular expressions library',
  homepage: 'https://github.com/kkos/oniguruma',
  github: 'https://github.com/kkos/oniguruma',
  programs: ['onig-config'],

  versionSource: {
    type: 'github-releases',
    repo: 'kkos/oniguruma',
    tagPattern: /^v(.+)$/,
  },

  distributable: {
    url: 'https://github.com/kkos/oniguruma/releases/download/v{{version}}/onig-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --disable-dependency-tracking --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
    ],
  },

  test: {
    script: [
      'test "$(onig-config --version)" = "{{version}}"',
    ],
  },
}
