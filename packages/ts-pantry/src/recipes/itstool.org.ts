import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'itstool.org',
  name: 'itstool',
  description: 'Translate XML with PO files using W3C Internationalization Tag Set rules',
  homepage: 'https://itstool.org/',
  github: 'https://github.com/itstool/itstool',
  programs: ['itstool'],
  platforms: ['linux/x86-64'],
  dependencies: {
    'gnome.org/libxml2': '*',
    'python.org': '>=3.11<3.12',
  },
  versionSource: {
    type: 'github-tags',
    repo: 'itstool/itstool',
    tagPattern: /^v?(\d+\.\d+\.\d+)$/,
  },
  distributable: {
    url: 'https://files.itstool.org/itstool/itstool-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'sed -i\'\' -e \'s|#!/.* -s|#!/usr/bin/env python|g\' {{prefix}}/bin/itstool',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}'],
    },
  },
}
