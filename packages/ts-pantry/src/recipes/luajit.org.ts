import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'luajit.org',
  name: 'luajit',
  description: 'Mirror of the LuaJIT git repository',
  homepage: 'https://luajit.org',
  github: 'https://github.com/LuaJIT/LuaJIT',
  programs: ['luajit', 'luajit-{{version.marketing}}.'],
  versionSource: {
    type: 'github-releases',
    repo: 'LuaJIT/LuaJIT',
    tagPattern: /^v(.+?)(?:\.ROLLING)?$/,
  },
  distributable: {
    url: 'https://github.com/LuaJIT/LuaJIT/archive/v{{version.raw}}.ROLLING.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'make --jobs {{hw.concurrency}} amalg PREFIX={{prefix}}',
      'make --jobs {{hw.concurrency}} install PREFIX={{prefix}}',
      'mkdir -p {{prefix}}/doc',
      'mv doc/* {{prefix}}/doc/',
      'cd "{{prefix}}/bin"',
      'ln -s luajit-{{version.raw}}. luajit',
      'cd "{{prefix}}/lib"',
      'ln -s libluajit-5.1.dylib libluajit.dylib',
      'ln -s libluajit-5.1.a libluajit.a',
      '',
    ],
  },
}
