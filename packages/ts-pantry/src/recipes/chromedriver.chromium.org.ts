import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'chromedriver.chromium.org',
  name: 'chromedriver',
  programs: ['chromedriver'],
  platforms: ['darwin', 'linux/x86-64'],
  buildDependencies: {
    'gnu.org/wget': '*',
  },

  build: {
    script: [
      'wget https://chromedriver.storage.googleapis.com/{{version.raw}}/chromedriver_${SUFFIX}.zip',
      'unzip chromedriver_${SUFFIX}.zip',
      'mkdir -p {{prefix}}/bin',
      'install chromedriver {{prefix}}/bin/',
    ],
  },
}
