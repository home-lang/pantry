import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'swig.org',
  name: 'swig',
  description: 'SWIG is a software development tool that connects programs written in C and C++ with a variety of high-level programming languages.',
  homepage: 'https://www.swig.org/',
  github: 'https://github.com/swig/swig',
  programs: ['swig', 'ccache-swig'],
  versionSource: {
    type: 'github-releases',
    repo: 'swig/swig/tags',
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/swig/swig/swig-{{version}}/swig-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pcre.org/v2': '*',
  },

  build: {
    script: [
      './configure --prefix="{{prefix}}" --with-swiglibdir={{prefix}}/lib',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      '',
    ],
  },
}
