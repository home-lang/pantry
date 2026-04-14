import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openjpeg.org',
  name: 'opj',
  description: 'Official repository of the OpenJPEG project',
  homepage: 'https://www.openjpeg.org/',
  github: 'https://github.com/uclouvain/openjpeg',
  programs: ['opj_compress', 'opj_decompress', 'opj_dump'],
  versionSource: {
    type: 'github-releases',
    repo: 'uclouvain/openjpeg',
  },
  distributable: {
    url: 'https://github.com/uclouvain/openjpeg/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libpng.org': '^1',
    'simplesystems.org/libtiff': '^4',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
  },
}
