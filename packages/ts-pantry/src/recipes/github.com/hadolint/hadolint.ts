import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/hadolint/hadolint',
  name: 'hadolint',
  programs: [
    'hadolint',
  ],
  buildDependencies: {
    'haskell.org': '~9.10',
    'haskell.org/cabal': '^3',
    'git-scm.org': '^2',
    linux: {
      'gnu.org/binutils': '~2.44',
    },
  },
  distributable: {
    url: 'https://github.com/hadolint/hadolint/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s|Merge objects command.*|Merge objects command", "/usr/bin/ld")|\' settings',
        if: 'darwin',
        'working-directory': '${{deps.haskell.org.prefix}}/.ghcup/ghc/9.10.3/lib/ghc-9.10.3/lib',
      },
      {
        run: 'sed -i \'s|Merge objects command.*|Merge objects command", "{{deps.gnu.org/binutils.prefix}}/bin/ld")|\' settings',
        if: 'linux',
        'working-directory': '${{deps.haskell.org.prefix}}/.ghcup/ghc/9.10.3/lib/ghc-9.10.3/lib',
      },
      'export LDFLAGS="$(echo $LDFLAGS | tr \' \' \'\\n\' | grep -v -- \'-rpath\' | tr \'\\n\' \' \')"',
      {
        run: 'sed -i -f $PROP hadolint.cabal',
        if: 'darwin',
      },
      'cabal v2-update',
      'cabal v2-install $ARGS',
    ],
    env: {
      ARGS: [
        '--jobs={{hw.concurrency}}',
        '--install-method=copy',
        '--installdir={{prefix}}/bin',
      ],
    },
  },
  test: {
    script: [
      'hadolint --version | grep {{version}}',
      'echo $(hadolint $FIXTURE || true) | grep DL3006',
    ],
  },
}
