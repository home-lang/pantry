import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libtasn1',
  name: 'libtasn1',
  programs: [
    'asn1Coding',
    'asn1Decoding',
    'asn1Parser',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/libtasn1/libtasn1-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'asn1Coding pkix.asn assign.asn1',
      'asn1Decoding pkix.asn assign.out PKIX1.Dss-Sig-Value 2>&1 | grep \'Decoding: SUCCESS\'',
    ],
  },
}
