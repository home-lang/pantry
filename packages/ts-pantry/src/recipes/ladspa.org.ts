import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ladspa.org',
  name: 'ladspa',
  description: 'Linux Audio Developer\\',
  homepage: 'https://www.ladspa.org',
  programs: ['analyseplugin', 'applyplugin', 'listplugins'],
  platforms: ['linux'],
  distributable: {
    url: 'https://www.ladspa.org/download/ladspa_sdk_{{version.raw}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/libsndfile/libsndfile': '^1.2',
  },

  build: {
    script: [
      'make install $ARGS',
    ],
    env: {
      'ARGS': ['INSTALL_PLUGINS_DIR={{prefix}}/lib/ladspa', 'INSTALL_INCLUDE_DIR={{prefix}}/include', 'INSTALL_BINARY_DIR={{prefix}}/bin'],
    },
  },
}
