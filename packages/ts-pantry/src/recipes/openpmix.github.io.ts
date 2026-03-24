import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openpmix.github.io',
  name: 'openpmix.github',
  description: 'Process Management Interface for HPC environments',
  homepage: 'https://openpmix.github.io/',
  github: 'https://github.com/openpmix/openpmix',
  programs: ['palloc', 'pattrs', 'pctrl', 'pevent', 'plookup', 'pmix_info', 'pmixcc', 'pps', 'pquery'],
  versionSource: {
    type: 'github-releases',
    repo: 'openpmix/openpmix',
  },
  distributable: {
    url: 'https://github.com/openpmix/openpmix/releases/download/v{{version}}/pmix-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'open-mpi.org/hwloc': '^2.10',
    'libevent.org': '^2.1',
    'zlib.net': '^1.3',
  },
  buildDependencies: {
    'python.org': '^3.11',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--disable-silent-rules', '--enable-ipv6', '--sysconfdir={{prefix}}/etc', '--with-hwloc={{deps.open-mpi.org/hwloc.prefix}}', '--with-libevent={{deps.libevent.org.prefix}}'],
    },
  },
}
