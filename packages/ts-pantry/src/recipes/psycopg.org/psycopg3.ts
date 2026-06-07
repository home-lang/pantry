import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'psycopg.org/psycopg3',
  name: 'psycopg3',
  github: 'https://github.com/psycopg/psycopg',
  programs: [],
  versionSource: {
    type: 'github-tags',
    repo: 'psycopg/psycopg',
  },
  dependencies: {
    'python.org': '~3.11',
    'postgresql.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/psycopg/psycopg.git',
    // pkgx pins the git checkout to the release tag (`ref: ${{version.tag}}`);
    // psycopg tags are unprefixed (e.g. `3.2.1`) and resolved via the GitHub API.
    ref: '{{version.tag}}',
  } as Recipe['distributable'] & { ref: string },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} \'./psycopg[binary]\'',
    ],
    // pkgx: `skip: fix-machos # needs headerpad`
    skip: ['fix-machos'],
  },
}
