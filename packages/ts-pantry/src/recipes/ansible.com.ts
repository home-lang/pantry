import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ansible.com',
  name: 'ansible',
  description: 'Ansible is a radically simple IT automation platform that makes your applications and systems easier to deploy and maintain. Automate everything from code deployment to network configuration to cloud management, in a language that approaches plain English, using SSH, with no agents to install on remote systems. https://docs.ansible.com.',
  homepage: 'https://www.ansible.com/',
  github: 'https://github.com/ansible/ansible',
  programs: ['ansible', 'ansible-config', 'ansible-connection', 'ansible-console', 'ansible-doc', 'ansible-galaxy', 'ansible-inventory', 'ansible-playbook', 'ansible-pull', 'ansible-test', 'ansible-vault'],
  versionSource: {
    type: 'github-releases',
    repo: 'ansible/ansible',
  },
  distributable: {
    url: 'https://github.com/ansible/ansible/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.12',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      '${{prefix}}/venv/bin/pip install paramiko',
      'bkpyvenv seal {{prefix}} ansible ansible-config ansible-connection ansible-console ansible-doc ansible-galaxy ansible-inventory ansible-playbook ansible-pull ansible-test ansible-vault',
      'cd "${{prefix}}/lib"',
      'cp {{deps.python.org.prefix}}/lib/libpython{{deps.python.org.version.marketing}}.so* .',
    ],
  },
}
