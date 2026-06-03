import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'curl.se/ca-certs',
  name: 'ca-certs',
  programs: [],
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'mkdir -p "{{prefix}}/ssl"',
      'URL_VER=$(echo {{version.raw}} | tr -- . -)',
      'curl -k https://curl.se/ca/cacert-$URL_VER.pem -o "{{prefix}}"/ssl/cert.pem',
    ],
  },
  test: {
    script: [
      'curl https://tea.xyz',
    ],
  },
}
