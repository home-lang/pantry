/**
 * **radicle** - Radicle CLI
 *
 * @domain `radicle.org`
 * @programs `rad`, `git-remote-rad`, `rad-account`, `rad-auth`, `rad-checkout`, ... (+21 more)
 * @version `0.6.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install radicle.org`
 * @homepage https://app.radicle.network/alt-clients.radicle.eth/radicle-cli
 * @dependencies `openssl.org^1.1.1`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.radicleorg
 * console.log(pkg.name)        // "radicle"
 * console.log(pkg.description) // "Radicle CLI"
 * console.log(pkg.programs)    // ["rad", "git-remote-rad", ...]
 * console.log(pkg.versions[0]) // "0.6.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/radicle-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const radicleorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'radicle' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'radicle.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Radicle CLI' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/radicle.org/package.yml' as const,
  homepageUrl: 'https://app.radicle.network/alt-clients.radicle.eth/radicle-cli' as const,
  githubUrl: 'https://github.com/radicle-dev/radicle-cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install radicle.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +radicle.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install radicle.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rad',
    'git-remote-rad',
    'rad-account',
    'rad-auth',
    'rad-checkout',
    'rad-clone',
    'rad-edit',
    'rad-ens',
    'rad-gov',
    'rad-help',
    'rad-init',
    'rad-inspect',
    'rad-issue',
    'rad-ls',
    'rad-merge',
    'rad-patch',
    'rad-path',
    'rad-pull',
    'rad-push',
    'rad-remote',
    'rad-reward',
    'rad-rm',
    'rad-self',
    'rad-sync',
    'rad-track',
    'rad-untrack',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1.1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.1',
    '0.6.0',
    '0.5.1',
    '0.5.0',
    '0.4.0',
    '0.3.1',
    '0.3.0',
    '0.2.1',
    '0.2.0',
    '0.1.2',
    '0.0.1',
    '0.0.0',
  ] as const,
  aliases: [] as const,
}

export type RadicleorgPackage = typeof radicleorgPackage
