import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'jemalloc.net',
  name: 'jemalloc',
  homepage: 'http://jemalloc.net/',
  github: 'https://github.com/jemalloc/jemalloc',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'jemalloc/jemalloc',
  },
  distributable: {
    url: 'https://github.com/jemalloc/jemalloc/releases/download/{{version}}/jemalloc-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'docbook.org': '*',
  },

  build: {
    script: [
      'if [ -f version ]; then mv version VERSION.jemalloc; fi',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      'cd "${{prefix}}/include/jemalloc"',
      'sed -i \'s/defined(JEMALLOC_USE_CXX_THROW)/defined(JEMALLOC_USE_CXX_THROW) \\&\\& \\!defined(__clang__)/g\' jemalloc.h',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-debug', '--with-jemalloc-prefix='],
    },
  },
}
