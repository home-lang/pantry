import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cask.readthedocs.io',
  name: 'cask',
  description: 'Project management tool for Emacs',
  homepage: 'https://cask.readthedocs.io/',
  github: 'https://github.com/cask/cask',
  programs: ['cask'],
  versionSource: {
    type: 'github-releases',
    repo: 'cask/cask',
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
      'install *.el {{prefix}}/',
      'cp -a package-build {{prefix}}',
      'cd "${{prefix}}/elisp"',
      'ln ../cask.el .',
      'ln ../cask-bootstrap.el .',
      '',
      'touch {{prefix}}/.no-upgrade',
    ],
  },
}
