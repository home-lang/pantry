import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 's3tools.org',
  name: 's3cmd',
  description: 'Official s3cmd repo -- Command line tool for managing S3 compatible storage services (including Amazon S3 and CloudFront).',
  homepage: 'https://s3tools.org/s3cmd',
  github: 'https://github.com/s3tools/s3cmd',
  programs: ['s3cmd'],
  versionSource: {
    type: 'github-releases',
    repo: 's3tools/s3cmd',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'https://github.com/s3tools/s3cmd/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/s3cmd',
    ],
  },
}
