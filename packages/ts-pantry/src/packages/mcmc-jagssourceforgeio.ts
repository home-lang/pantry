/**
 * **jags** - Just Another Gibbs Sampler for Bayesian MCMC simulation
 *
 * @domain `mcmc-jags.sourceforge.io`
 * @programs `jags`
 * @version `4.3.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mcmc-jags.sourceforge.io`
 * @homepage https://mcmc-jags.sourceforge.io
 * @dependencies `gnu.org/gcc`, `linux:netlib.org/lapack^3` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mcmcjagssourceforgeio
 * console.log(pkg.name)        // "jags"
 * console.log(pkg.description) // "Just Another Gibbs Sampler for Bayesian MCMC si..."
 * console.log(pkg.programs)    // ["jags"]
 * console.log(pkg.versions[0]) // "4.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mcmc-jags-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mcmcjagssourceforgeioPackage = {
  /**
  * The display name of this package.
  */
  name: 'jags' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mcmc-jags.sourceforge.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Just Another Gibbs Sampler for Bayesian MCMC simulation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mcmc-jags.sourceforge.io/package.yml' as const,
  homepageUrl: 'https://mcmc-jags.sourceforge.io' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mcmc-jags.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mcmc-jags.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mcmc-jags.sourceforge.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'jags',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'gnu.org/gcc',
    'linux:netlib.org/lapack^3',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.3.2',
  ] as const,
  aliases: [] as const,
}

export type McmcjagssourceforgeioPackage = typeof mcmcjagssourceforgeioPackage
