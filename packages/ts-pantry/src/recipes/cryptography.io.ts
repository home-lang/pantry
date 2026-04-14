import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cryptography.io',
  name: 'cryptography',
  description: 'cryptography is a package designed to expose cryptographic primitives and recipes to Python developers.',
  homepage: 'https://cryptography.io',
  github: 'https://github.com/pyca/cryptography',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'pyca/cryptography',
  },
  distributable: {
    url: 'git+https://github.com/pyca/cryptography.git',
  },
  dependencies: {
    'python.org': '>=3.11',
    'github.com/python-cffi/cffi': '^1.16',
    'openssl.org': '>=1.1',
  },
  buildDependencies: {
    'python.org/typing_extensions': '*',
    'rust-lang.org': '>=1.65',
  },

  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
      'cd "${{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
    ],
    skip: ['fix-machos'],
  },
}
