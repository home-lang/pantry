import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'httpie.io',
  name: 'httpie',
  description: '🥧 HTTPie CLI  — modern, user-friendly command-line HTTP client for the API era. JSON support, colors, sessions, downloads, plugins & more.',
  homepage: 'https://httpie.io/',
  github: 'https://github.com/httpie/cli',
  programs: ['http', 'httpie', 'https'],
  versionSource: {
    type: 'github-releases',
    repo: 'httpie/httpie',
  },
  distributable: {
    url: 'https://github.com/httpie/httpie/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/http',
      'cp {{prefix}}/bin/http {{prefix}}/bin/https',
      'cp {{prefix}}/bin/http {{prefix}}/bin/httpie',
      '',
    ],
  },
}
