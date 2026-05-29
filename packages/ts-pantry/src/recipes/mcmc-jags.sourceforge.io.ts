import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mcmc-jags.sourceforge.io',
  name: 'jags',
  description: 'Just Another Gibbs Sampler for Bayesian MCMC simulation',
  homepage: 'https://mcmc-jags.sourceforge.io',
  programs: ['jags'],
  dependencies: {
    'gnu.org/gcc': '*', // libstdc++
    linux: {
      'netlib.org/lapack': '^3',
    },
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/mcmc-jags/JAGS/{{version.major}}.x/Source/JAGS-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
    },
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      {
        run: [
          'sed -i.bak -e \'s|{{prefix}}|$(dirname $0)/..|g\' jags',
          'rm jags.bak',
        ],
        'working-directory': '{{prefix}}/bin',
      },
    ],
  },
}
