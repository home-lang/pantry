import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'render.com',
  name: 'render',
  description: 'Command-line interface for Render',
  homepage: 'https://render.com/docs/cli',
  github: 'https://github.com/render-oss/cli',
  programs: ['render'],
  versionSource: {
    type: 'github-releases',
    repo: 'render-oss/render-cli/tags',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'https://github.com/render-oss/render-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'deno.land': '^1.30',
  },

  build: {
    script: [
      'rm deps-lock.json',
      'sed -e "s/ajv-formats@2.1.1/ajv-formats@2.1.0/" -e "s/ajv@8.11.0/ajv@8.11.1/" deps.ts',
      'deno compile --unstable --allow-net --allow-read --allow-run --allow-write --allow-env --output=\'{{prefix}}/bin/render\' ./entry-point.ts',
    ],
    skip: ['fix-patchelf'],
  },
}
