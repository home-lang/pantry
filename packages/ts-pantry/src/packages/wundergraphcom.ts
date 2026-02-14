/**
 * **wunderctl** - WunderGraph is a Backend for Frontend Framework to optimize frontend, fullstack and backend developer workflows through API Composition.
 *
 * @domain `wundergraph.com`
 * @programs `wunderctl`
 * @version `0.181.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wundergraph.com`
 * @homepage https://wundergraph.com
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wundergraphcom
 * console.log(pkg.name)        // "wunderctl"
 * console.log(pkg.description) // "WunderGraph is a Backend for Frontend Framework..."
 * console.log(pkg.programs)    // ["wunderctl"]
 * console.log(pkg.versions[0]) // "0.181.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wundergraph-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const wundergraphcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'wunderctl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'wundergraph.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'WunderGraph is a Backend for Frontend Framework to optimize frontend, fullstack and backend developer workflows through API Composition.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wundergraph.com/package.yml' as const,
  homepageUrl: 'https://wundergraph.com' as const,
  githubUrl: 'https://github.com/wundergraph/wundergraph' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install wundergraph.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wundergraph.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wundergraph.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'wunderctl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.181.0',
    '0.180.2',
    '0.180.1',
    '0.180.0',
    '0.179.1',
    '0.179.0',
    '0.178.0',
    '0.177.0',
    '0.176.3',
    '0.176.2',
    '0.176.1',
    '0.176.0',
    '0.175.0',
    '0.174.0',
    '0.173.0',
    '0.172.0',
    '0.171.0',
    '0.170.0',
    '0.169.3',
    '0.169.2',
  ] as const,
  aliases: [] as const,
}

export type WundergraphcomPackage = typeof wundergraphcomPackage
