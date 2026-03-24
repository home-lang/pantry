import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jbang.dev',
  name: 'jbang',
  description: 'Unleash the power of Java - JBang Lets Students, Educators and Professional Developers create, edit and run self-contained source-only Java programs with unprecedented ease.',
  homepage: 'https://jbang.dev/',
  github: 'https://github.com/jbangdev/jbang',
  programs: ['jbang'],
  versionSource: {
    type: 'github-releases',
    repo: 'jbangdev/jbang',
  },
  distributable: {
    url: 'https://github.com/jbangdev/jbang/releases/download/v{{version}}/jbang-{{version}}.zip',
    stripComponents: 1,
  },
  dependencies: {
    'openjdk.org': '*',
  },

  build: {
    script: [
      'cd "{{prefix}}"',
      'mkdir -p bin libexec',
      'cp -r ./* {{prefix}}/libexec/',
      'cd "{{prefix}}/bin"',
      'ln -s ../libexec/bin/jbang jbang',
    ],
  },
}
