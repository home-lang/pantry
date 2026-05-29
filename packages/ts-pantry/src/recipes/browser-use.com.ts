import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'browser-use.com',
  name: 'browser-use',
  description: 'Make websites accessible for AI agents',
  homepage: 'https://browser-use.com/',
  github: 'https://github.com/browser-use/browser-use',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'browser-use/browser-use',
    tagPattern: /^v(.+)$/,
  },
  dependencies: {
    'python.org': '~3.12', // no torch<2.3.0 for 3.13
  },
  buildDependencies: {
    'rust-lang.org': '*', // for rpds
  },
  distributable: {
    url: 'https://github.com/browser-use/browser-use/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'python -m pip install --prefix={{prefix}} . playwright $ADDITIONAL_PACKAGES',
      // needs headerpad
      {
        run: 'python -m pip install --no-deps --force-reinstall --no-cache-dir -v --no-binary :all: --prefix={{prefix}} jiter rpds-py',
        if: 'darwin',
      },
    ],
    skip: ['fix-machos'], // breaks binaries on aarch64
    env: {
      'darwin/x86-64': {
        // torch removed darwin/x86-64 binaries in 2.3.0
        // https://github.com/pytorch/pytorch/pull/116726
        ADDITIONAL_PACKAGES: 'torch>=1.11.0,<2.3.0',
      },
      'darwin': {
        LDFLAGS: '$LDFLAGS -Wl,-headerpad_max_install_names',
      },
    },
  },

  test: {
    script: ['python -c \'import browser_use; print(browser_use)\''],
  },
}
