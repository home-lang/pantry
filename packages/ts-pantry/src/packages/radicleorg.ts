/**
 * **radicle** - Radicle CLI
 *
 * @domain `radicle.org`
 * @programs `rad`, `git-remote-rad`, `rad-account`, `rad-auth`, `rad-checkout`, ... (+21 more)
 * @version `0.6.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install radicle.org`
 * @homepage https://app.radicle.network/alt-clients.radicle.eth/radicle-cli
 * @dependencies `openssl.org^1.1.1`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.radicleorg
 * console.log(pkg.name)        // "radicle"
 * console.log(pkg.description) // "Radicle CLI"
 * console.log(pkg.programs)    // ["rad", "git-remote-rad", ...]
 * console.log(pkg.versions[0]) // "0.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/radicle-org.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install radicle.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +radicle.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install radicle.org' as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.1',
  ] as const,
  aliases: [] as const,
}

export type RadicleorgPackage = typeof radicleorgPackage
