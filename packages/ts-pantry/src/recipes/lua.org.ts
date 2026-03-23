import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'lua.org',
  name: 'lua',
  description: 'Powerful, lightweight programming language',
  homepage: 'https://www.lua.org/',
  programs: ['lua', 'luac'],
  distributable: {
    url: 'http://www.lua.org/ftp/lua-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/readline': '*',
  },

  build: {
    script: [
      'cd "src"',
      'sed -i -e "s_\\$(MYCFLAGS)_${CFLAGS} -fPIC_" -e "s_\\$(MYLDFLAGS)_${LDFLAGS}_" Makefile',
      'export OS="${OS%-readline}"',
      'make $OS INSTALL_TOP={{prefix}}',
      'make install INSTALL_TOP={{prefix}}',
      'cd "src"',
      'OBJS="$(grep ^CORE_O= Makefile | sed -e \'s/^CORE_O=//\')"',
      'OBJS="$OBJS $(grep ^LIB_O= Makefile | sed -e \'s/^LIB_O=//\')"',
      'cc $CFLAGS $LDFLAGS -o {{prefix}}/lib/liblua.$EXT -shared $OBJS',
      'cd "${{prefix}}/lib/pkgconfig"',
      'cp $PROP lua.pc',
      'cd "${{prefix}}/lib/pkgconfig"',
      'sed -i \'s/-lm/-lm -ldl/\' lua.pc',
      'make test',
    ],
  },
}
