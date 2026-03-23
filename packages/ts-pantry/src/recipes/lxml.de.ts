import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'lxml.de',
  name: 'lxml.de',
  description: 'The lxml XML toolkit for Python',
  homepage: 'https://lxml.de/',
  github: 'https://github.com/lxml/lxml',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'lxml/lxml',
    tagPattern: /\/^lxml-\//,
  },
  distributable: {
    url: 'https://github.com/lxml/lxml/releases/download/lxml-{{version}}/lxml-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '^3.10',
    'gnome.org/libxml2': '~2.12',
    'gnome.org/libxslt': '^1',
  },

  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
      'cd "{{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
    ],
  },
}
