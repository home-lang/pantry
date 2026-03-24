import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wimlib.net',
  name: 'wimlib',
  description: 'Library to create, extract, and modify Windows Imaging files',
  homepage: 'https://wimlib.net/',
  programs: ['mkwinpeimg', 'wimappend', 'wimapply', 'wimapply', 'wimdelete', 'wimdir', 'wimexport', 'wimextract', 'wiminfo', 'wimjoin', 'wimlib-imagex', 'wimmount', 'wimmountrw', 'wimoptimize', 'wimsplit', 'wimunmount', 'wimupdate', 'wimverify'],
  distributable: {
    url: 'https://wimlib.net/downloads/wimlib-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^3.1.0',
    'gnome.org/libxml2': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--disable-debug', '--disable-dependency-tracking', '--disable-silent-rules', '--prefix={{prefix}}', '--without-fuse', '--without-ntfs-3g'],
    },
  },
}
