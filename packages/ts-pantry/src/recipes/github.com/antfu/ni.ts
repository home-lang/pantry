import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/antfu/ni',
  name: 'ni',
  programs: [
    'na',
    'nci',
    'ni',
    'nlx',
    'nr',
    'nu',
    'nun',
    'nup',
  ],
  dependencies: {
    'nodejs.org': '>=14',
    'npmjs.com': '*',
  },
  buildDependencies: {
    'pnpm.io': '^10.6',
  },
  distributable: {
    url: 'https://github.com/antfu/ni/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'npm i -D @antfu/eslint-config@2.21.0',
        if: '^0.22',
      },
      'pnpm install',
      'pnpm run build',
      {
        run: 'cp $SRCROOT/package.json .\ncp $SRCROOT/pnpm-workspace.yaml .\ncp -R $SRCROOT/bin .\ncp -R $SRCROOT/dist .\ncp -R $SRCROOT/node_modules .',
        'working-directory': '${{prefix}}/libexec',
      },
      {
        run: 'mkdir -p ../../bin\nfor x in *.mjs; do\n  ln -s ../libexec/bin/$x ../../bin/${x%.mjs}\ndone\n',
        'working-directory': '${{prefix}}/libexec/bin',
      },
      {
        run: 'ln -s nu nup',
        if: '<25',
        'working-directory': '${{prefix}}/bin',
      },
      {
        run: 'ln -s nup nu',
        if: '>=25',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    // in v29 @rolldown/binding-darwin-arm64 has binary blobs that don't have enough room
    // to rewrite the headers (and don't need it anyway)
    skip: ['fix-machos'],
  },
  test: {
    script: [
      'touch .nirc',
      '(ni --version || true) | grep {{version}}',
    ],
  },
}
