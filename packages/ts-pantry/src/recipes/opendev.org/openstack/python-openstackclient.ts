import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opendev.org/openstack/python-openstackclient',
  name: 'python-openstackclient',
  programs: [
    'openstack',
    'openstack-inventory',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3',
  },
  distributable: undefined,
  build: {
    script: [
      'pip download --no-deps --no-binary :all: --dest . python-openstackclient=={{version}}',
      'tar zxvf python_openstackclient-{{version}}.tar.gz --strip-components=1',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      {
        run: 'cp -a openstackclient {{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages/',
        if: '>=8.2',
      },
      'bkpyvenv seal {{prefix}} openstack openstack-inventory',
    ],
  },
  test: {
    script: [
      'openstack help server list',
      'openstack-inventory --help',
    ],
  },
}
