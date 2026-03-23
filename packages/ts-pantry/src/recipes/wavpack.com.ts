import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'wavpack.com',
  name: 'wavpack',
  description: 'WavPack encode/decode library, command-line programs, and several plugins',
  homepage: 'https://www.wavpack.com/',
  github: 'https://github.com/dbry/WavPack',
  programs: ['wavpack', 'wvunpack', 'wvtag', 'wvgain'],
  versionSource: {
    type: 'github-releases',
    repo: 'dbry/WavPack/tags',
  },
  distributable: {
    url: 'https://www.wavpack.com/wavpack-{{version}}.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/patch': '*',
  },

  build: {
    script: [
      'patch -p1 < props/5.8.0.patch',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"'],
    },
  },
}
