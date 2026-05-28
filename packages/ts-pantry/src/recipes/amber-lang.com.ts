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

  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
