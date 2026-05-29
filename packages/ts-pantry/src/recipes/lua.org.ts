import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lua.org',
  name: 'lua',
  description: 'Powerful, lightweight programming language',
  homepage: 'https://www.lua.org/',
  programs: ['lua', 'luac'],
  distributable: {
    url: 'https://www.lua.org/ftp/lua-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/readline': '*',
  },

  build: {
    env: {
      darwin: {
        OS: 'macosx',
        EXT: 'dylib',
      },
      linux: {
        OS: 'linux-readline',
        EXT: 'so',
      },
    },
    script: [
      {
        run: 'sed -i -e "s_\\$(MYCFLAGS)_${CFLAGS} -fPIC_" -e "s_\\$(MYLDFLAGS)_${LDFLAGS}_" Makefile',
        'working-directory': 'src',
      },
      // `linux-readline` target was renamed to plain `linux` after 5.5
      {
        run: 'export OS="${OS%-readline}"',
        if: '>=5.5',
      },
      'make $OS INSTALL_TOP={{prefix}}',
      'make install INSTALL_TOP={{prefix}}',
      // lua doesn't build liblua via its makefile, so do it by hand
      {
        run: [
          'OBJS="$(grep ^CORE_O= Makefile | sed -e \'s/^CORE_O=//\')"',
          'OBJS="$OBJS $(grep ^LIB_O= Makefile | sed -e \'s/^LIB_O=//\')"',
          'cc $CFLAGS $LDFLAGS -o {{prefix}}/lib/liblua.$EXT -shared $OBJS',
        ],
        'working-directory': 'src',
      },
      {
        run: 'cp $PROP lua.pc',
        prop: {
          content: [
            'V= {{version.marketing}}',
            'R= {{version}}',
            'prefix={{prefix}}',
            'INSTALL_BIN= ${prefix}/bin',
            'INSTALL_INC= ${prefix}/include/lua',
            'INSTALL_LIB= ${prefix}/lib',
            'INSTALL_MAN= ${prefix}/share/man/man1',
            'INSTALL_LMOD= ${prefix}/share/lua/${V}',
            'INSTALL_CMOD= ${prefix}/lib/lua/${V}',
            'exec_prefix=${prefix}',
            'libdir=${exec_prefix}/lib',
            'includedir=${prefix}/include/lua',
            '',
            'Name: Lua',
            'Description: An Extensible Extension Language',
            'Version: {{version}}',
            'Requires:',
            'Libs: -L${libdir} -llua -lm',
            'Cflags: -I${includedir}',
          ],
        },
        'working-directory': '${{prefix}}/lib/pkgconfig',
      },
      {
        run: 'sed -i \'s/-lm/-lm -ldl/\' lua.pc',
        'working-directory': '${{prefix}}/lib/pkgconfig',
        if: 'linux',
      },
    ],
  },
}
