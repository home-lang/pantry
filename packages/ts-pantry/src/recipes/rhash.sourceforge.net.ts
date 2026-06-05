import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rhash.sourceforge.net',
  name: 'rhash.sourceforge',
  description: 'Utility for computing and verifying hash sums of files',
  homepage: 'https://sourceforge.net/projects/rhash/',
  github: 'https://github.com/rhash/RHash',
  programs: ['whirlpool-hash', 'tiger-hash', 'tth-hash', 'rhash', 'sfv-hash', 'magnet-link', 'has160-hash', 'gost12-256-hash', 'gost12-512-hash', 'edonr512-hash', 'edonr256-hash', 'ed2k-link'],
  versionSource: {
    type: 'github-releases',
    repo: 'rhash/RHash',
  },
  distributable: {
    url: 'https://github.com/rhash/RHash/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // rhash ships a hand-rolled configure that probes `$CC`/gcc/cc and bails
      // with "compiler not found" if none is detected; pin it to the buildkit
      // compiler wrapper so the detection succeeds on macOS too.
      './configure --cc="${CC:-cc}" --disable-gettext --prefix={{prefix}}',
      'make rhash',
      'make --jobs {{hw.concurrency}}',
      'make install',
      'make -C librhash install-lib-headers',
      'make test',
    ],
  },
}
