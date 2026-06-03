import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gphoto.org/libgphoto2',
  name: 'libgphoto2',
  programs: [
    'gphoto2-config',
    'gphoto2-port-config',
  ],
  dependencies: {
    'libgd.github.io': '^2.3',
    'libjpeg-turbo.org': '^2',
    'libexif.github.io': '^0.6',
    'gnu.org/libtool': '^2.4',
    'libusb.info/compat': '^0.1',
    'curl.se': '^8',
    'gnome.org/libxml2': '^2.12',
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
      'systemd.io': '*',
    },
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/gphoto/libgphoto/{{version}}/libgphoto2-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
      'sed -i \'s|{{prefix}}|\\$(dirname \\$0)/..|g\' {{prefix}}/bin/*',
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE $(gphoto2-config --libs) -o test',
      './test',
      'gphoto2-config --version | grep {{version}}',
    ],
  },
}
