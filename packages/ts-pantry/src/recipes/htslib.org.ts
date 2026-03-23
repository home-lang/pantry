import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'htslib.org',
  name: 'htslib',
  description: 'C library for high-throughput sequencing data formats',
  homepage: 'https://www.htslib.org/',
  github: 'https://github.com/samtools/htslib',
  programs: ['bgzip', 'htsfile', 'tabix'],
  versionSource: {
    type: 'github-releases',
    repo: 'samtools/htslib',
  },
  distributable: {
    url: 'https://github.com/samtools/htslib/releases/download/{{version.raw}}/htslib-{{version.raw}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'sourceware.org/bzip2': '*',
    'tukaani.org/xz': '*',
    'zlib.net': '^1',
    'curl.se': '>=5',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '^1',
  },

  build: {
    script: [
      'autoreconf -i',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"'],
    },
  },
}
