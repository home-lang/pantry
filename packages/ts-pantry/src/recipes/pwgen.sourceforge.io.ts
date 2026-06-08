import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pwgen.sourceforge.io',
  name: 'pwgen',
  description: 'Password generator',
  homepage: 'https://pwgen.sourceforge.net/',
  programs: ['pwgen'],
  // Upstream uses zero-padded minor versions (2.08), NOT semver (2.8.0).
  // The auto-converted version 2.8.0 404s on SourceForge; pin to the real tag.
  versionSource: {
    type: 'url-pattern',
    url: 'https://downloads.sourceforge.net/project/pwgen/pwgen/{{version}}/pwgen-{{version}}.tar.gz',
    knownVersions: ['2.08', '2.07', '2.06', '2.05'],
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/pwgen/pwgen/{{version}}/pwgen-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-debug', '--disable-dependency-tracking', '--mandir={{prefix}}/man'],
    },
  },
}
