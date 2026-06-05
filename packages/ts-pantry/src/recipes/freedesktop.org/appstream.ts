import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/appstream',
  name: 'appstream',
  programs: [
    'appstreamcli',
  ],
  dependencies: {
    'gnome.org/glib': '2',
    'github.com/hughsie/libxmlb': '0',
    'pyyaml.org/libyaml': '0',
    'github.com/pantoniou/libfyaml': '0',
    'curl.se': '8',
    'gnome.org/libxml2': '2',
    darwin: {
      'openldap.org': '2',
    },
    linux: {
      'systemd.io': '*',
    },
  },
  buildDependencies: {
    'cmake.org': '3',
    'mesonbuild.com': '>=0.61',
    'ninja-build.org': '*',
    'gnome.org/gobject-introspection': '*',
    'itstool.org': '*',
    'gnome.org/vala': '*',
    'gnome.org/libxslt': '*',
    'docbook.org/xsl': '*',
    'debian.org/bash-completion': '*',
    linux: {
      'gnu.org/gperf': '*',
    },
  },
  distributable: {
    url: 'https://github.com/ximion/appstream/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s_http://docbook.sourceforge.net/release/xsl/current_{{deps.docbook.org/xsl.prefix}}/libexec/docbook-xsl_\' meson.build',
        'working-directory': 'docs',
      },
      'meson setup build $ARGS',
      'meson compile -C build',
      'meson install -C build',
    ],
    env: {
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
      ARGS: [
        '--prefix={{prefix}}',
        '-Dstemming=false',
        '-Dvapi=true',
        '-Dgir=true',
        '-Ddocs=false',
        '-Dapidocs=false',
        '-Dinstall-docs=false',
        '-Dman=false',
      ],
      darwin: {
        ARGS: [
          '-Dsystemd=false',
        ],
      },
    },
  },
  test: {
    script: [
      'cc -o test $FIXTURE $(pkg-config --cflags --libs appstream)',
      'cp $FIXTURE appdata.xml',
      './test',
    ],
  },
}
