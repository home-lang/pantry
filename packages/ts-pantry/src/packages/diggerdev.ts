/**
 * **digger** - Digger is an open source IaC orchestration tool. Digger allows you to run IaC in your existing CI pipeline ⚡️
 *
 * @domain `digger.dev`
 * @programs `digger`
 * @version `0.6.143` (228 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install digger.dev`
 * @homepage https://digger.dev
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.diggerdev
 * console.log(pkg.name)        // "digger"
 * console.log(pkg.description) // "Digger is an open source IaC orchestration tool..."
 * console.log(pkg.programs)    // ["digger"]
 * console.log(pkg.versions[0]) // "0.6.143" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/digger-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const diggerdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'digger' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'digger.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Digger is an open source IaC orchestration tool. Digger allows you to run IaC in your existing CI pipeline ⚡️  ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/digger.dev/package.yml' as const,
  homepageUrl: 'https://digger.dev' as const,
  githubUrl: 'https://github.com/diggerhq/digger' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install digger.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +digger.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install digger.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'digger',
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.143',
    '0.6.142',
    '0.6.141',
    '0.6.140',
    '0.6.139',
    '0.6.138',
    '0.6.137',
    '0.6.136.1',
    '0.6.136',
    '0.6.135',
    '0.6.134',
    '0.6.133',
    '0.6.132',
    '0.6.131',
    '0.6.130',
    '0.6.129',
    '0.6.128',
    '0.6.127',
    '0.6.126',
    '0.6.125',
  ] as const,
  aliases: [] as const,
}

export type DiggerdevPackage = typeof diggerdevPackage
