import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'luarocks.org',
  name: 'luarocks',
  description: 'LuaRocks is the package manager for the Lua programming language.',
  homepage: 'https://luarocks.org/',
  github: 'https://github.com/luarocks/luarocks',
  programs: ['luarocks', 'luarocks-admin'],
  versionSource: {
    type: 'github-tags',
    repo: 'luarocks/luarocks',
  },
  distributable: {
    url: 'https://github.com/luarocks/luarocks/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'lua.org': '*',
    'info-zip.org/unzip': '*',
  },
  buildDependencies: {
    'gnu.org/make': '^4',
    'gnu.org/sed': '^4',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      {
        run: [
          'fix-shebangs.ts luarocks-admin luarocks',
          'sed -i -e \'s|\\[\\[{{prefix}}|debug.getinfo(1).source:match("@?(.*/)") .. \\[\\[..|g\' luarocks-admin luarocks',
        ],
        'working-directory': '{{prefix}}/bin',
      },
      // luarocks config has fixed paths
      {
        run: [
          'mv bin tbin',
          'mkdir bin',
        ],
        'working-directory': '{{prefix}}',
      },
      {
        run: [
          'cat $PROP >luarocks',
          'cat $PROP >luarocks-admin',
          'chmod +x luarocks luarocks-admin',
        ],
        'working-directory': '{{prefix}}/bin',
        prop: {
          content: [
            '#!/bin/sh',
            '',
            'd="$(cd "$(dirname "$0")"/.. && pwd)"',
            'x="$(basename "$0")"',
            '',
            'cat >"$d/etc/luarocks/config-{{deps.lua.org.version.marketing}}.lua" <<EOF',
            '-- LuaRocks configuration',
            '',
            'rocks_trees = {',
            '  { name = "user", root = home .. "/.luarocks" };',
            '  { name = "system", root = "${PKGX_DIR:-$HOME/.pkgx}/luarocks.org/v{{version}}" };',
            '}',
            'variables = {',
            '  LUA_DIR = "${PKGX_DIR:-$HOME/.pkgx}/lua.org/v{{deps.lua.org.version.marketing}}";',
            '  LUA_BINDIR = "${PKGX_DIR:-$HOME/.pkgx}/lua.org/v{{deps.lua.org.version.marketing}}/bin";',
            '  LUA_VERSION = "{{deps.lua.org.version.marketing}}";',
            '  LUA = "${PKGX_DIR:-$HOME/.pkgx}/lua.org/v{{deps.lua.org.version.marketing}}/bin/lua";',
            '}',
            'EOF',
            '',
            'exec "$d/tbin/$x" "$@"',
            '',
          ].join('\n'),
        },
      },
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--sysconfdir={{prefix}}/etc', '--rocks-tree={{prefix}}', '--force-config', '--disable-incdir-check'],
    },
  },
}
