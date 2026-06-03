import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/pnpm.io',
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
      'mkdir -p {{prefix}}',
      'ln -s pnpm.cjs bin/pnpm',
      'ln -s pnpx.cjs bin/pnpx',
      'chmod +x bin/*',
      'cp props/pnpmrc dist',
      'cp -r bin dist package.json {{prefix}}',
    ],
  },
}
