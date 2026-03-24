import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mitmproxy.org',
  name: 'mitmproxy',
  description: 'An interactive TLS-capable intercepting HTTP proxy for penetration testers and software developers.',
  homepage: 'https://mitmproxy.org',
  github: 'https://github.com/mitmproxy/mitmproxy',
  programs: ['mitmproxy'],
  versionSource: {
    type: 'github-releases',
    repo: 'mitmproxy/mitmproxy',
  },
  distributable: {
    url: 'https://github.com/mitmproxy/mitmproxy/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} mitmproxy',
    ],
  },
}
