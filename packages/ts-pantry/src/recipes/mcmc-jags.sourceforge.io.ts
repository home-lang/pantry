import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mcmc-jags.sourceforge.io',
  name: 'jags',
  description: 'Just Another Gibbs Sampler for Bayesian MCMC simulation',
  homepage: 'https://mcmc-jags.sourceforge.io',
  programs: ['', '', '', '', '', '', '', ''],
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
