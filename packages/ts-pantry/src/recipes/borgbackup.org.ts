import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'borgbackup.org',
  name: 'borg',
  description: 'Deduplicating archiver with compression and authenticated encryption.',
  homepage: 'https://www.borgbackup.org/',
  github: 'https://github.com/borgbackup/borg',
  programs: ['borg', 'borgfs'],
  versionSource: {
    type: 'github-releases',
    repo: 'borgbackup/borg',
  },
  distributable: {
    url: 'https://github.com/borgbackup/borg/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
    'github.com/Cyan4973/xxHash': '^0.8',
  },
  buildDependencies: {
    'python.org': '^3.10',
    'openssl.org': '^1.1',
    'facebook.com/zstd': '*',
    'lz4.org': '*',
    linux: {
      'savannah.nongnu.org/acl': '^2.3.1',
    },
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install -r requirements.d/development.txt',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} borg borgfs',
    ],
    env: {
      'BORG_OPENSSL_PREFIX': '{{deps.openssl.org.prefix}}',
      'BORG_LIBLZ4_PREFIX': '{{deps.lz4.org.prefix}}',
      'BORG_LIBZSTD_PREFIX': '{{deps.facebook.com/zstd.prefix}}',
      'BORG_LIBXXHASH_PREFIX': '{{deps.github.com/Cyan4973/xxHash.prefix}}',
      // libacl is Linux-only; on darwin BORG_LIBACL_PREFIX must be unset
      // (macOS has no libacl) so it stays inside the linux-keyed group.
      'BORG_LIBACL_PREFIX': {
        linux: '{{deps.savannah.nongnu.org/acl.prefix}}',
      },
    },
  },
}
