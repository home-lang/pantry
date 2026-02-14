/**
 * **ethaddrgen** - Custom Ethereum vanity address generator made in Rust
 *
 * @domain `github.com/Limeth/ethaddrgen`
 * @programs `ethaddrgen`
 * @version `1.0.7` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Limeth/ethaddrgen`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlimethethaddrgen
 * console.log(pkg.name)        // "ethaddrgen"
 * console.log(pkg.description) // "Custom Ethereum vanity address generator made i..."
 * console.log(pkg.programs)    // ["ethaddrgen"]
 * console.log(pkg.versions[0]) // "1.0.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Limeth/ethaddrgen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ethaddrgenPackage = {
  /**
  * The display name of this package.
  */
  name: 'ethaddrgen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/Limeth/ethaddrgen' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Custom Ethereum vanity address generator made in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Limeth/ethaddrgen/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Limeth/ethaddrgen' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/Limeth/ethaddrgen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Limeth/ethaddrgen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Limeth/ethaddrgen' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ethaddrgen',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.7',
  ] as const,
  aliases: [] as const,
}

export type EthaddrgenPackage = typeof ethaddrgenPackage
