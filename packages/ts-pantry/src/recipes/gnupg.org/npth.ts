import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org/npth',
  name: 'npth',
  description: 'The New GNU Portable Threads Library',
  homepage: 'https://gnupg.org/software/npth/',
  // npth installs a shared/static library plus the npth-config helper; it
  // exposes no general-purpose executables, so pkgx lists no `provides`.
  programs: [],
  versionSource: {
    type: 'url-pattern',
    url: 'https://gnupg.org/ftp/gcrypt/npth/npth-{{version}}.tar.bz2',
    knownVersions: [
      '1.8',
      '1.7',
      '1.6',
    ],
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/npth/npth-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{prefix}} --disable-dependency-tracking --enable-static $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
