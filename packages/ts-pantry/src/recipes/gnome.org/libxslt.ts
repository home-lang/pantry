import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/libxslt',
  name: 'xslt',
  description: 'XSLT processing library (libxslt + xsltproc)',
  homepage: 'http://xmlsoft.org/XSLT/',
  github: 'https://github.com/GNOME/libxslt',
  programs: ['xslt-config', 'xsltproc'],
  versionSource: {
    type: 'github-tags',
    repo: 'GNOME/libxslt',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://download.gnome.org/sources/libxslt/{{version.marketing}}/libxslt-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/libxml2': '*', // varies by version :(
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'gnome.org/libxml2': '~2.15.1', // since 1.1.45
  },
  propsDir: '../props/gnome.org/libxslt',

  build: {
    script: [
      'patch -p1 < props/xslt-config.patch.in',

      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',

      {
        run: 'sed -i'
          + ' -e \'s|{{prefix}}|"$prefix"|g\''
          + ' -e \'s|{{deps.gnome.org/libxml2.prefix}}|""$libxml2_prefix""|g\''
          + ' xslt-config',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--without-python', // we don't yet know how to support this
        '--without-plugins', // doesn't build and we couldn't debug
      ],
    },
  },
}
