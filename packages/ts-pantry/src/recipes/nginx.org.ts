import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nginx.org',
  name: 'nginx',
  description: 'HTTP(S) server and reverse proxy, and IMAP/POP3 proxy server',
  homepage: 'https://nginx.org/',
  github: 'https://github.com/nginx/nginx',
  programs: ['nginx'],
  versionSource: {
    type: 'github-releases',
    repo: 'nginx/nginx/tags',
    tagPattern: /\/^release-\//,
  },
  distributable: {
    url: 'https://nginx.org/download/nginx-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pcre.org': '8.45',
    'zlib.net': '^1.2.13',
    'openssl.org': '^1.1.1k',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      '',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--with-http_ssl_module', '--with-stream'],
    },
  },
}
