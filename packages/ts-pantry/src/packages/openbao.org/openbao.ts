/**
 * **openbao** - OpenBao exists to provide a software solution to manage, store, and distribute sensitive data including secrets, certificates, and keys.
 *
 * @domain `openbao.org/openbao`
 * @programs `bao`, `bao-setup`
 * @version `2.4.4` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openbao.org/openbao`
 * @homepage https://openbao.org/
 * @buildDependencies `go.dev`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openbaoorgopenbao
 * console.log(pkg.name)        // "openbao"
 * console.log(pkg.description) // "OpenBao exists to provide a software solution t..."
 * console.log(pkg.programs)    // ["bao", "bao-setup"]
 * console.log(pkg.versions[0]) // "2.4.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openbao-org/openbao.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openbaoorgopenbaoPackage = {
  /**
   * The display name of this package.
   */
  name: 'openbao' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openbao.org/openbao' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'OpenBao exists to provide a software solution to manage, store, and distribute sensitive data including secrets, certificates, and keys.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openbao.org/openbao/package.yml' as const,
  homepageUrl: 'https://openbao.org/' as const,
  githubUrl: 'https://github.com/openbao/openbao' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openbao.org/openbao' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openbao.org/openbao -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openbao.org/openbao' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bao',
    'bao-setup',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
    'gnu.org/coreutils',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.4',
    '2.4.3',
    '2.4.1',
    '2.4.0',
    '2.3.2',
    '2.3.1',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type OpenbaoorgopenbaoPackage = typeof openbaoorgopenbaoPackage
