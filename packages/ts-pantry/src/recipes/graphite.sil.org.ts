import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'graphite.sil.org',
  name: 'gr2fonttest',
  description: 'Graphite is a "smart font" system developed specifically to handle the complexities of lesser-known languages of the world.',
  homepage: 'https://graphite.sil.org/',
  github: 'https://github.com/silnrsi/graphite',
  programs: ['gr2fonttest'],
  versionSource: {
    type: 'github-releases',
    repo: 'silnrsi/graphite/releases/tags',
  },
  distributable: {
    url: 'https://github.com/silnrsi/graphite/releases/download/{{version}}/graphite2-{{version}}.tgz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '^3',
    'freetype.org': '*',
  },

  build: {
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
  },
}
