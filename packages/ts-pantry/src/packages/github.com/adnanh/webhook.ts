/**
 * **webhook** - webhook is a lightweight incoming webhook server to run shell commands
 *
 * @domain `github.com/adnanh/webhook`
 * @programs `webhook`
 * @version `2.8.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/adnanh/webhook`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomadnanhwebhook
 * console.log(pkg.name)        // "webhook"
 * console.log(pkg.description) // "webhook is a lightweight incoming webhook serve..."
 * console.log(pkg.programs)    // ["webhook"]
 * console.log(pkg.versions[0]) // "2.8.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/adnanh/webhook.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const webhookPackage = {
  /**
   * The display name of this package.
   */
  name: 'webhook' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/adnanh/webhook' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'webhook is a lightweight incoming webhook server to run shell commands' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/adnanh/webhook/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/adnanh/webhook' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/adnanh/webhook' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/adnanh/webhook -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/adnanh/webhook' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'webhook',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.8.2',
    '2.8.1',
  ] as const,
  aliases: [] as const,
}

export type WebhookPackage = typeof webhookPackage
