import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'gts.sourceforge.net',
  name: 'gts.sourceforge',
  description: 'GNU triangulated surface library',
  homepage: 'https://gts.sourceforge.net/',
  programs: ['delaunay', 'gts2dxf', 'gts2oogl', 'gts2stl', 'gtscheck', 'gtscompare', 'gtstemplate', 'stl2gts', 'transform'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/gts/gts/{{version.raw}}/gts-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/glib': '>=2.4.0',
  },
  buildDependencies: {
    'gnu.org/automake': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'autoreconf -fvi',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '# FIXME: gts-config prevents relocatability with absolute paths',
      'rm {{ prefix }}/bin/gts-config',
      '',
    ],
    env: {
      'ARGS': '--prefix={{prefix}}',
    },
  },
}
