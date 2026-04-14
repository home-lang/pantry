import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'certbot.eff.org',
  name: 'certbot',
  description: 'Certbot - automatically enable HTTPS on your website',
  homepage: 'https://certbot.eff.org/',
  github: 'https://github.com/certbot/certbot',
  programs: ['certbot'],
  versionSource: {
    type: 'github-releases',
    repo: 'certbot/certbot',
  },
  distributable: {
    url: 'https://github.com/certbot/certbot/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/certbot',
    ],
    env: {
      'SRCROOT': '$SRCROOT/certbot',
    },
  },
}
