import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'scons.org',
  name: 'scons',
  description: 'Substitute for classic \\',
  homepage: 'https://www.scons.org/',
  github: 'https://github.com/SCons/scons',
  programs: ['scons'],
  versionSource: {
    type: 'github-releases',
    repo: 'SCons/scons',
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/scons/scons/{{version}}/SCons-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/scons',
    ],
  },
}
