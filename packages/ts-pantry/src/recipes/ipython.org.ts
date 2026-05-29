import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ipython.org',
  name: 'ipython',
  description: 'Official repository for IPython itself. Other repos in the IPython organization contain things like the website, documentation builds, etc.',
  homepage: 'https://ipython.org/',
  github: 'https://github.com/ipython/ipython',
  programs: ['ipython', 'ipython3'],
  versionSource: {
    type: 'github-releases',
    repo: 'ipython/ipython',
  },
  distributable: {
    url: 'https://github.com/ipython/ipython/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    // IPython 9.11.0+ requires Python >=3.12; mirror pkgx's gate so the venv
    // is staged with a compatible interpreter.
    'python.org': '>=3.12<3.15',
  },

  build: {
    script: [
      // broken version number in some releases (e.g. 8.19.1); rewrite release.py
      {
        run: 'sed -i -f $PROP release.py',
        prop: [
          's/^_version_major = .*/_version_major = {{version.major}}/',
          's/^_version_minor = .*/_version_minor = {{version.minor}}/',
          's/^_version_patch = .*/_version_patch = {{version.patch}}/',
          's/^_version_extra = .*/_version_extra = ""/',
          '',
        ].join('\n'),
        'working-directory': 'IPython/core',
      },
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/python -m pip install .',
      'bkpyvenv seal {{prefix}} ipython',
      {
        run: 'ln -s ipython ipython3',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
}
