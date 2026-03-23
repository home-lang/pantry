import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'gnuplot.info',
  name: 'gnuplot',
  description: 'Command-driven, interactive function plotting',
  homepage: 'http://www.gnuplot.info/',
  programs: ['gnuplot'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/gnuplot/gnuplot/{{version}}/gnuplot-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libgd.github.io': '*',
    'gnome.org/pango': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--disable-dependency-tracking', '--disable-silent-rules', '--prefix={{prefix}}', '--without-tutorial', '--disable-wxwidgets', '--without-qt', '--without-x', '--without-latex', '--without-lua'],
    },
  },
}
