import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'python-pillow.org',
  name: 'python-pillow',
  description: 'Python Imaging Library (Fork)',
  homepage: 'https://python-pillow.github.io',
  github: 'https://github.com/python-pillow/Pillow',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'python-pillow/Pillow',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/python-pillow/Pillow/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  dependencies: {
    'libjpeg-turbo.org': '^2',
    'pngquant.org/lib': '^4',
    'simplesystems.org/libtiff': '^4',
    'x.org/xcb': '^1',
    'littlecms.com': '^2',
    'openjpeg.org': '^2',
    'tcl.tk/tcl': '^8',
    'google.com/webp': '^1',
    'zlib.net': '^1',
    'python.org': '~3.12',
  },

  buildDependencies: {
    'pypa.io/setuptools': '*',
  },

  build: {
    script: [
      'python -m pip install $ARGS .',
    ],
    env: {
      MAX_CONCURRENCY: '{{hw.concurrency}}',
      ARGS: [
        '--prefix={{prefix}}',
        '-C debug=true',
        '-C tiff=enable',
        '-C freetype=enable',
        '-C lcms=enable',
        '-C webp=enable',
        '-C xcb=enable',
      ],
    },
  },
}
