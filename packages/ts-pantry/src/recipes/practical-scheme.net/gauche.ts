import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'practical-scheme.net/gauche',
  name: 'gauche',
  programs: [
    'gauche-cesconv',
    'gauche-config',
    'gauche-install',
    'gauche-package',
    'gosh',
  ],
  dependencies: {
    'curl.se/ca-certs': '>=2023',
    'github.com/Mbed-TLS/mbedtls': '^3.5',
    'github.com/besser82/libxcrypt': '^4.4',
    'zlib.net': '^1.3',
  },
  distributable: {
    url: 'https://github.com/shirok/Gauche/releases/download/release{{version}}/Gauche-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
      {
        run: 'fix-shebangs.ts gauche-cesconv gauche-install gauche-package',
        'working-directory': '${{prefix}}/bin',
      },
      {
        run: 'GAUCHE_DIR=$(ls -d */ | grep gauche)',
        'working-directory': '${{prefix}}/lib',
      },
      {
        run: 'ln -s ${GAUCHE_DIR}/{{version}}/lib GAUCHE_LOAD_PATH',
        'working-directory': '${{prefix}}/share',
      },
      {
        run: 'GAUCHE_PLATFORM_DIR=$(ls -d */ | grep -i $(uname -s))',
        'working-directory': '${{prefix}}/lib/${GAUCHE_DIR}/{{version}}',
      },
      {
        run: 'ln -s ${GAUCHE_DIR}/{{version}}/${GAUCHE_PLATFORM_DIR} GAUCHE_DYNLOAD_PATH',
        'working-directory': '${{prefix}}/lib',
      },
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--enable-multibyte=utf-8',
        '--with-ca-bundle={{deps.curl.se/ca-certs.prefix}}/ssl/cert.pem',
      ],
    },
  },
  test: {
    script: [
      'gosh -V | grep {{version}}',
      'gosh test.scm | grep {{version}}',
    ],
  },
}
