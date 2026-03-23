import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tcl-lang.org',
  name: 'tcl-lang',
  description: 'Tool Command Language',
  homepage: 'https://www.tcl-lang.org',
  programs: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/tcl/Tcl/{{version}}/tcl{{version}}-src.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run:',
      'run: ln -s tclsh{{version.marketing}} tclsh',
      'run:',
      'run:',
      'run: ln -s wish{{version.marketing}} wish',
      'run:',
      'run:',
      'run:',
      'run:',
      'rm {{prefix}}/bin/sqlite3_analyzer',
      'run: sed -i -f $PROP *.sh',
      'run: sed -i -f $PROP */*.sh',
    ],
  },
}
