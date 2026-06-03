import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ansible.com/ansible-lint',
  name: 'ansible-lint',
  programs: [
    'ansible-lint',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/ansible/ansible-lint/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} ansible-lint',
    ],
  },
  test: {
    script: [
      'cat $FIXTURE | sed \'/^$/d\' >test.toml',
      'ansible-lint --project-dir . test.toml',
    ],
  },
}
