import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'oauth2-proxy.github.io',
  name: 'oauth2-proxy',
  description: 'A reverse proxy that provides authentication with Google, Azure, OpenID Connect and many more identity providers.',
  homepage: 'https://oauth2-proxy.github.io/oauth2-proxy/',
  github: 'https://github.com/oauth2-proxy/oauth2-proxy',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'oauth2-proxy/oauth2-proxy',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/oauth2-proxy/oauth2-proxy/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for oauth2-proxy.github.io"',    ],
  },
}
