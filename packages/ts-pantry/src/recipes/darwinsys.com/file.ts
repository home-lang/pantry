import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'darwinsys.com/file',
  name: 'file',
  propsDir: '../props/darwinsys.com/file',
  programs: [
    'file',
  ],
  dependencies: {
    'zlib.net': 1,
  },
  buildDependencies: {
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://astron.com/pub/file/file-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'patch -p1 <props/relocatable.diff',
      {
        run: 'sed -i -e \'s/^protected const char/file_protected const char/\' magic.c',
        if: '>=5.45',
        'working-directory': 'src',
      },
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
      'cp -a magic/Magdir {{prefix}}/share/misc/magic',
    ],
  },
}
