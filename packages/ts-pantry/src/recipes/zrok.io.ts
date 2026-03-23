import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'zrok.io',
  name: 'zrok',
  description: 'Geo-scale, next-generation peer-to-peer sharing platform built on top of OpenZiti.',
  homepage: 'https://zrok.io',
  github: 'https://github.com/openziti/zrok',
  programs: ['zrok', 'copyto', 'pastefrom'],
  versionSource: {
    type: 'github-releases',
    repo: 'openziti/zrok',
  },
  distributable: {
    url: 'https://github.com/openziti/zrok/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.23.0',
    'nodejs.org': '^21',
    'npmjs.com': '^10',
  },

  build: {
    script: [
      'cd "ui"',
      'npm install',
      'npm run build',
      'cd "agent/agentUi"',
      'npm install',
      'npm run build',
      'mkdir -p "{{prefix}}/bin"',
      'go build -o "{{prefix}}/bin" ./...',
    ],
  },
}
