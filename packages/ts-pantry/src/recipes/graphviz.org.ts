import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'graphviz.org',
  name: 'graphviz',
  description: 'Graph visualization software from AT&T and Bell Labs',
  homepage: 'https://graphviz.org/',
  programs: ['acyclic', 'bcomps', 'ccomps', 'circo', 'cluster', 'dijkstra', 'dot', 'dot2gxl', 'dot_builtins', 'edgepaint', 'fdp', 'gc', 'gml2gv', 'graphml2gv', 'gv2gml', 'gv2gxl', 'gvcolor', 'gvgen', 'gvmap', 'gvmap.sh', 'gvpack', 'gvpr', 'gxl2dot', 'gxl2gv', 'mm2gv', 'neato', 'nop', 'osage', 'patchwork', 'prune', 'sccmap', 'sfdp', 'tred', 'twopi', 'unflatten'],
  distributable: {
    url: 'https://gitlab.com/api/v4/projects/4207231/packages/generic/graphviz-releases/{{ version }}/graphviz-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'cairographics.org': '^1.1.10',
    'freedesktop.org/fontconfig': '^2.3.95',
    'freetype.org': '^2.1.0',
    'gnome.org/glib': '^2.11.0',
    'gnome.org/pango': '^1.12.4',
    'gnu.org/libtool': '^2',
    'libexpat.github.io': '^2.0.0',
    'libpng.org': '^1.2.10',
    'poppler.freedesktop.org': '*',
    'zlib.net': '^1.2.3',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'cd "${{prefix}}/lib"',
      'rm *.la',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-debug', '--disable-dependency-tracking', '--disable-swig', '--disable-tcl', '--without-quartz', '--without-gdk', '--without-gtk', '--without-qt', '--without-x', '--with-freetype2'],
    },
  },
}
