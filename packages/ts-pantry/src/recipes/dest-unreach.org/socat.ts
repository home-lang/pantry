import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dest-unreach.org/socat',
  name: 'socat',
  programs: [
    'socat',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'gnu.org/readline': '^8.2',
  },
  distributable: {
    url: 'http://www.dest-unreach.org/socat/download/socat-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--mandir={{prefix}}/share/man',
      ],
    },
  },
  test: {
    script: [
      'socat -V | grep {{version}}',
      'echo -e "GET / HTTP/1.1\\r\\nhost: www.dest-unreach.org\\r\\nConnection: close\\r\\n\\r\\n" | socat - TCP4:www.dest-unreach.org:80 | tee index.html',
      'grep "<title>Welcome to dest-unreach.org!</title>" index.html',
    ],
  },
}
