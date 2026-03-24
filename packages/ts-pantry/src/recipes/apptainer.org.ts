import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apptainer.org',
  name: 'apptainer',
  description: 'Application container and unprivileged sandbox platform for Linux',
  homepage: 'https://apptainer.org/',
  github: 'https://github.com/apptainer/apptainer',
  programs: ['apptainer', 'run-singularity', 'singularity'],
  platforms: ['linux'],
  versionSource: {
    type: 'github-releases',
    repo: 'apptainer/apptainer',
  },
  distributable: {
    url: 'https://github.com/apptainer/apptainer/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/seccomp/libseccomp': '2',
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '~1.21',
  },

  build: {
    script: [
      'echo {{version}} >VERSION',
      './mconfig $ARGS',
      'cd "builddir"',
      'make',
      'make install',
      'cd "${{prefix}}/etc/apptainer"',
      'touch apptainer.conf',
      'mkdir -p {{prefix}}/var/apptainer/mnt/session',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--sysconfdir={{prefix}}/etc', '--localstatedir={{prefix}}/var', '--without-suid', '-P release-stripped', '-v'],
      'CFLAGS': '$CFLAGS -O0',
    },
  },
}
