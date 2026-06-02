import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vamp-plugins.org',
  name: 'vamp',
  description: 'Audio processing plugin system sdk',
  homepage: 'https://www.vamp-plugins.org/',
  github: 'vamp-plugins/vamp-plugin-sdk',
  programs: ['vamp-simple-host', 'vamp-rdf-template-generator'],
  dependencies: {
    'xiph.org/flac': '^1.4',
    'xiph.org/ogg': '^1.3',
    'github.com/libsndfile/libsndfile': '^1.2',
  },
  buildDependencies: {
    'gnu.org/automake': '*',
    'curl.se': '*',
  },
  // Upstream moved its source tarballs from code.soundsoftware.ac.uk (now
  // unreachable) to GitHub releases. The release tag is the marketing version
  // (vamp-plugin-sdk-v2.10) while the asset uses the full version (2.10.0).
  versionSource: {
    type: 'url-pattern',
    url: 'https://github.com/vamp-plugins/vamp-plugin-sdk/releases/download/vamp-plugin-sdk-v{{version.marketing}}/vamp-plugin-sdk-{{version}}.tar.gz',
    knownVersions: ['2.10.0'],
  },
  distributable: {
    url: 'https://github.com/vamp-plugins/vamp-plugin-sdk/releases/download/vamp-plugin-sdk-v{{version.marketing}}/vamp-plugin-sdk-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
}
