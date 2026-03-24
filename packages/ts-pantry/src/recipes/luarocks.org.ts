import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'luarocks.org',
  name: 'luarocks',
  description: 'LuaRocks is the package manager for the Lua programming language.',
  homepage: 'https://luarocks.org/',
  github: 'https://github.com/luarocks/luarocks',
  programs: ['luarocks', 'luarocks-admin'],
  versionSource: {
    type: 'github-releases',
    repo: 'luarocks/luarocks/tags',
  },
  distributable: {
    url: 'https://github.com/luarocks/luarocks/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'lua.org': '*',
  },
  buildDependencies: {
    'gnu.org/make': '^4',
    'gnu.org/sed': '^4',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'cd "${{prefix}}/bin"',
      'fix-shebangs.ts luarocks-admin luarocks',
      'sed -i -e \'s|\\[\\[{{prefix}}|debug.getinfo(1).source:match("@?(.*/)") .. \\[\\[..|g\' luarocks-admin luarocks',
      'cd "${{prefix}}"',
      'mv bin tbin',
      'mkdir bin',
      'cd "${{prefix}}/bin"',
      'cat $PROP >luarocks',
      'cat $PROP >luarocks-admin',
      'chmod +x luarocks luarocks-admin',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--sysconfdir={{prefix}}/etc', '--rocks-tree={{prefix}}', '--force-config', '--disable-incdir-check'],
    },
  },
}
