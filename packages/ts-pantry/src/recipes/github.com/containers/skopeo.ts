import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/containers/skopeo',
  name: 'skopeo',
  programs: [
    'skopeo',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.18',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://github.com/containers/skopeo/archive/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'patch -p1 < props/embed-policy.patch',
        if: '<1.21.0',
      },
      'CGO_ENABLED=0 make BUILDTAGS=containers_image_openpgp GO_DYN_FLAGS=',
      'mkdir -p \'{{prefix}}/bin\'',
      'mv -f ./bin/skopeo \'{{prefix}}/bin\'',
    ],
    env: {
      DISABLE_DOCS: '1',
    },
  },
  test: {
    script: [
      'skopeo --version | tee /dev/stderr | grep -q -w \'{{ version }}\'',
      'cp $FIXTURE policy.json',
      'skopeo --override-os linux copy docker://hello-world docker-archive:hello-world.tar:example.com/hello-world',
      'skopeo list-tags docker-archive:hello-world.tar | tee /dev/stderr | grep -q -w \'example.com/hello-world\'',
    ],
  },
}
