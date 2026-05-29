import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cask.readthedocs.io',
  name: 'cask',
  description: 'Project management tool for Emacs',
  homepage: 'https://cask.readthedocs.io/',
  github: 'https://github.com/cask/cask',
  programs: ['cask'],
  versionSource: {
    type: 'github-tags',
    repo: 'cask/cask',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/cask/cask/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/coreutils': '*',
    'gnu.org/emacs': '*',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}',
      'cp -a bin {{prefix}}',
      // Lisp files must stay here: https://github.com/cask/cask/issues/305
      'install *.el {{prefix}}/',
      'cp -a package-build {{prefix}}',
      {
        run: [
          'ln ../cask.el .',
          'ln ../cask-bootstrap.el .',
        ],
        'working-directory': '{{prefix}}/elisp',
      },
      'touch {{prefix}}/.no-upgrade',
    ],
  },
}
