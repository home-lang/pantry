import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'oracle.com/oci-cli',
  name: 'oci-cli',
  programs: [
    'oci',
  ],
  dependencies: {
    'certifi.io/python-certifi': '^2024',
    'pyyaml.org/libyaml': '^0.2',
    'cryptography.io': '^42',
    'python.org': '^3.11',
  },
  buildDependencies: {
    'cmake.org': '*',
    'rust-lang.org': '*',
  },
  distributable: {
    url: 'https://github.com/oracle/oci-cli/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} oci',
    ],
  },
  test: {
    script: [
      'oci --version | grep {{version}}',
      'oci --help',
      'oci session validate 2>out.log || true',
      'cat out.log | grep \'ConfigFileNotFound\'',
    ],
  },
}
