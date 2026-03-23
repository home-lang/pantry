import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ipython.org',
  name: 'ipython',
  description: 'Official repository for IPython itself. Other repos in the IPython organization contain things like the website, documentation builds, etc.',
  homepage: 'https://ipython.org/',
  github: 'https://github.com/ipython/ipython',
  programs: ['ipython', 'ipython3'],
  versionSource: {
    type: 'github-releases',
    repo: 'ipython/ipython/tags',
  },
  distributable: {
    url: 'https://github.com/ipython/ipython/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.7<3.12',
  },

  build: {
    script: [
      'cd "IPython/core"',
      'sed -i -e \'s/^_version_major = .*/_version_major = {{version.major}}/\' -e \'s/^_version_minor = .*/_version_minor = {{version.minor}}/\' -e \'s/^_version_patch = .*/_version_patch = {{version.patch}}/\' -e \'s/^_version_extra = .*/_version_extra = ""/\' release.py',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/python -m pip install .',
      'bkpyvenv seal {{prefix}} ipython',
      'cd "${{prefix}}/bin"',
      'ln -s ipython ipython3',
    ],
  },
}
