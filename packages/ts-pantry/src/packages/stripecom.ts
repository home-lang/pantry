/**
 * **stripe** - A command-line tool for Stripe
 *
 * @domain `stripe.com`
 * @programs `stripe`
 * @version `1.54.0` (140 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install stripe.com`
 * @homepage https://stripe.com/docs/stripe-cli
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.stripecom
 * console.log(pkg.name)        // "stripe"
 * console.log(pkg.description) // "A command-line tool for Stripe"
 * console.log(pkg.programs)    // ["stripe"]
 * console.log(pkg.versions[0]) // "1.54.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/stripe-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install stripe.com' as const,
  pantryInstallCommand: 'pantry install stripe.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.54.0',
    '1.53.1',
    '1.53.0',
    '1.52.2',
    '1.52.1',
    '1.52.0',
    '1.51.1',
    '1.51.0',
    '1.50.11',
    '1.50.10',
    '1.50.9',
    '1.50.8',
    '1.50.6',
    '1.50.5',
    '1.50.4',
    '1.50.3',
    '1.50.2',
    '1.50.1',
    '1.50.0',
    '1.45.4',
    '1.45.3',
    '1.45.2',
    '1.45.1',
    '1.45.0',
    '1.44.1',
    '1.44.0',
    '1.43.8',
    '1.43.7',
    '1.43.6',
    '1.43.5',
    '1.43.4',
    '1.43.3',
    '1.43.2',
    '1.43.1',
    '1.43.0',
    '1.42.15',
    '1.42.14',
    '1.42.13',
    '1.42.12',
    '1.42.11',
    '1.42.10',
    '1.42.9',
    '1.42.8',
    '1.42.7',
    '1.42.6',
    '1.42.4',
    '1.42.3',
    '1.42.2',
    '1.42.1',
    '1.42.0',
    '1.41.2',
    '1.41.1',
    '1.40.9',
    '1.40.8',
    '1.40.7',
    '1.40.6',
    '1.40.5',
    '1.40.4',
    '1.40.3',
    '1.40.2',
    '1.40.1',
    '1.40.0',
    '1.39.0',
    '1.38.3',
    '1.38.2',
    '1.38.1',
    '1.38.0',
    '1.37.8',
    '1.37.7',
    '1.37.6',
    '1.37.5',
    '1.37.4',
    '1.37.3',
    '1.37.2',
    '1.37.1',
    '1.37.0',
    '1.36.0',
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
