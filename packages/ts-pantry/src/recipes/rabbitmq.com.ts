import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rabbitmq.com',
  name: 'rabbitmq',
  description: 'Open source RabbitMQ: core server and tier 1 (built-in) plugins',
  homepage: 'https://www.rabbitmq.com/',
  github: 'https://github.com/rabbitmq/rabbitmq-server',
  programs: ['rabbitmqctl', 'rabbitmq-defaults', 'rabbitmq-diagnostics', 'rabbitmq-env', 'rabbitmq-plugins', 'rabbitmq-queues', 'rabbitmq-server', 'rabbitmq-streams', 'rabbitmq-upgrade', 'vmware-rabbitmq'],
  versionSource: {
    type: 'github-releases',
    repo: 'rabbitmq/rabbitmq-server',
  },
  distributable: {
    url: 'https://github.com/rabbitmq/rabbitmq-server/releases/download/v{{version}}/rabbitmq-server-generic-unix-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'erlang.org': '26',
    'openssl.org': '^1.1',
    linux: {
      // since v4.2.4 for GCC_12.0.0 and GLIBCXX_3.4.29
      'gnu.org/gcc': '14',
      'gnu.org/gcc/libstdcxx': '14',
    },
  },

  build: {
    script: [
      'cd {{prefix}}',
      'cp -r $SRCROOT/* ./',
      'find . -mindepth 1 -maxdepth 1 -name \\*.pkgx.\\* -exec rm -rf {} \\;',
      'if test -f pkgx.yaml; then rm pkgx.yaml; fi',
      '',
      // The generic-unix tarball ships no `var` dir, so create it before use.
      'mkdir -p {{prefix}}/var/lib/rabbitmq {{prefix}}/var/og/rabbitmq',
    ],
  },
}
