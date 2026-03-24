import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'amber-lang.com',
  name: 'amber',
  description: 'Crystal web framework. Bare metal performance, productivity and happiness',
  homepage: 'https://amberframework.org/',
  github: 'https://github.com/Ph0enixKM/Amber',
  programs: ['amber'],
  versionSource: {
    type: 'github-releases',
    repo: 'Ph0enixKM/Amber',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/Ph0enixKM/Amber/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: cat $FIXTURE >test.ab',
      'test "$(amber test.ab)" = 2',
      'test "$(pkgx test.ab)" = 2',
      'run: amber test.ab test.sh',
      'run: amber build test.ab',
      'test "$(./test.sh)" = 2',
    ],
  },
}
