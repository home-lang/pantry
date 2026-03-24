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
    'erlang.org': '*',
  },

  build: {
    script: [
      'cd "{{prefix}}"',
      'cp -r $SRCROOT/* ./',
      'find . -mindepth 1 -maxdepth 1 -name \\*.pkgx.\\* -exec rm -rf {} \\;',
      'if test -f pkgx.yaml; then rm pkgx.yaml; fi',
      '',
      'cd "{{prefix}}/var"',
      'mkdir -p lib/rabbitmq og/rabbitmq',
    ],
  },
}
