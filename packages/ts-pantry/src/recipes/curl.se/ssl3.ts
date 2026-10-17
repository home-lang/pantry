import type { Recipe } from '../../../scripts/recipe-types'
import { recipe as curl } from '../curl.se'

// Keep the historical library-only domain on the same OpenSSL 3 recipe and
// complete runtime closure as the canonical package.
export const recipe: Recipe = {
  ...curl,
  domain: 'curl.se/ssl3',
  name: 'ssl3',
  programs: [],
}
