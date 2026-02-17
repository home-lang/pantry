/**
 * **stripe** - A command-line tool for Stripe
 *
 * @domain `stripe.com`
 * @programs `stripe`
 * @version `1.35.1` (63 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install stripe.com`
 * @homepage https://stripe.com/docs/stripe-cli
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.stripecom
 * console.log(pkg.name)        // "stripe"
 * console.log(pkg.description) // "A command-line tool for Stripe"
 * console.log(pkg.programs)    // ["stripe"]
 * console.log(pkg.versions[0]) // "1.35.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/stripe-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const stripecomPackage = {
  /**
  * The display name of this package.
  */
  name: 'stripe' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'stripe.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A command-line tool for Stripe' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/stripe.com/package.yml' as const,
  homepageUrl: 'https://stripe.com/docs/stripe-cli' as const,
  githubUrl: 'https://github.com/stripe/stripe-cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install stripe.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +stripe.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install stripe.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'stripe',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.35.1',
    '1.35.0',
    '1.34.0',
    '1.33.2',
    '1.33.1',
    '1.33.0',
    '1.32.0',
    '1.31.1',
    '1.31.0',
    '1.30.0',
    '1.29.0',
    '1.28.0',
    '1.27.0',
    '1.26.1',
    '1.26.0',
    '1.25.1',
    '1.25.0',
    '1.24.0',
    '1.23.10',
    '1.23.9',
    '1.23.8',
    '1.23.7',
    '1.23.6',
    '1.23.5',
    '1.23.4',
    '1.23.3',
    '1.23.2',
    '1.23.1',
    '1.23.0',
    '1.22.0',
    '1.21.11',
    '1.21.10',
    '1.21.9',
    '1.21.8',
    '1.21.7',
    '1.21.6',
    '1.21.5',
    '1.21.3',
    '1.21.2',
    '1.21.1',
    '1.21.0',
    '1.20.0',
    '1.19.5',
    '1.19.4',
    '1.19.3',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.0',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.7',
    '1.14.6',
    '1.14.5',
    '1.14.4',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.12',
  ] as const,
  aliases: [] as const,
}

export type StripecomPackage = typeof stripecomPackage
