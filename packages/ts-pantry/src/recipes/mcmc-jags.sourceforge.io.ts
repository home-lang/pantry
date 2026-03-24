import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mcmc-jags.sourceforge.io',
  name: 'jags',
  description: 'Just Another Gibbs Sampler for Bayesian MCMC simulation',
  homepage: 'https://mcmc-jags.sourceforge.io',
  programs: ['jags'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/mcmc-jags/JAGS/{{version.major}}.x/Source/JAGS-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'run: |',
    ],
  },
}
