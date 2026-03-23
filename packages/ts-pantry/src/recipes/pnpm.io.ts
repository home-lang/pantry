import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pnpm.io',
  name: 'pnp',
  description: 'Fast, disk space efficient package manager',
  homepage: 'https://pnpm.io/',
  github: 'https://github.com/pnpm/pnpm',
  programs: ['pnpm', 'pnpx'],
  versionSource: {
    type: 'github-releases',
    repo: 'pnpm/pnpm',
  },
  distributable: {
    url: 'https://registry.npmjs.org/pnpm/-/pnpm-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '*',
  },

  build: {
    script: [
      'mkdir -p "{{prefix}}"',
      'mv bin/pnpm.cjs bin/pnpm',
      'mv bin/pnpx.cjs bin/pnpx',
      'cp props/pnpmrc dist',
      'cp -r bin dist package.json {{prefix}}',
      '',
    ],
  },
}
