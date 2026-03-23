import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mujs.com',
  name: 'mujs',
  description: 'An embeddable Javascript interpreter in C.',
  homepage: 'https://www.mujs.com/',
  github: 'https://github.com/ccxvii/mujs',
  programs: ['mujs', 'mujs-pp'],
  versionSource: {
    type: 'github-releases',
    repo: 'ccxvii/mujs',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://mujs.com/downloads/mujs-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/readline': '~8.1',
  },
  buildDependencies: {
    'python.org': '^3',
  },

  build: {
    script: [
      'sed -i "s|-lreadline|-lreadline -lncurses|g" Makefile',
      'make prefix=\'{{prefix}}\' release',
      'make prefix=\'{{prefix}}\' install',
      'make prefix=\'{{prefix}}\' install-shared',
      'cd "{{prefix}}/lib/pkgconfig"',
      'sed -i "s/Version: \\([^\\ ]*\\)/Version: {{version}}/g" *.pc',
    ],
  },
}
