import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'checkov.io',
  name: 'checkov',
  description: 'Prevent cloud misconfigurations and find vulnerabilities during build-time in infrastructure as code, container images and open source packages with Checkov by Bridgecrew.',
  homepage: 'https://www.checkov.io/',
  github: 'https://github.com/bridgecrewio/checkov',
  programs: ['checkov'],
  versionSource: {
    type: 'github-releases',
    repo: 'bridgecrewio/checkov',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/bridgecrewio/checkov/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
    'stedolan.github.io/jq': '*',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      'pkgx +rust~1.70 +cargo\\<0.83 {{prefix}}/venv/bin/pip install "rustworkx$(jq -r .default.rustworkx.version Pipfile.lock | sed \'s/==/~=/\')"',
      'pkgx +rust~1.82 +cargo\\<0.83 {{prefix}}/venv/bin/pip install "orjson$(jq -r .default.orjson.version Pipfile.lock | sed \'s/==/~=/\')"',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} checkov',
    ],
  },
}
