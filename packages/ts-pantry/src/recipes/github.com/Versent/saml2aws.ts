import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Versent/saml2aws',
  name: 'saml2aws',
  programs: [
    'saml2aws',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/Versent/saml2aws/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/saml2aws',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/saml2aws',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'saml2aws --help',
      'saml2aws --version 2>&1 | grep {{version}}',
      'cp $FIXTURE ./_saml2aws',
      'saml2aws script 2>out.log || true',
      'cat out.log | grep \'Failed to validate account\'',
    ],
  },
}
