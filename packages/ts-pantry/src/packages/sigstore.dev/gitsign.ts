/**
 * **gitsign** - Keyless Git signing using Sigstore
 *
 * @domain `sigstore.dev/gitsign`
 * @programs `gitsign`, `gitsign-credential-cache`
 * @version `0.14.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sigstore.dev/gitsign`
 * @dependencies `git-scm.org`
 * @buildDependencies `go.dev@~1.23.4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sigstoredevgitsign
 * console.log(pkg.name)        // "gitsign"
 * console.log(pkg.description) // "Keyless Git signing using Sigstore"
 * console.log(pkg.programs)    // ["gitsign", "gitsign-credential-cache"]
 * console.log(pkg.versions[0]) // "0.14.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sigstore-dev/gitsign.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sigstoredevgitsignPackage = {
  /**
  * The display name of this package.
  */
  name: 'gitsign' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sigstore.dev/gitsign' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Keyless Git signing using Sigstore' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sigstore.dev/gitsign/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sigstore/gitsign' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sigstore.dev/gitsign' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sigstore.dev/gitsign -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sigstore.dev/gitsign' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gitsign',
    'gitsign-credential-cache',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'git-scm.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.23.4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.14.0',
    '0.13.0',
    '0.12.0',
    '0.11.0',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.0',
    '0.8.1',
    '0.8.0',
    '0.7.1',
  ] as const,
  aliases: [] as const,
}

export type SigstoredevgitsignPackage = typeof sigstoredevgitsignPackage
