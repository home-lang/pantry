/**
 * **linux-pam** - Linux PAM (Pluggable Authentication Modules for Linux) project
 *
 * @domain `linux-pam.org`
 * @programs `faillock`, `mkhomedir_helper`, `pam_namespace_helper`, `pam_timestamp_check`, `unix_chkpwd`
 * @version `1.7.2` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install linux-pam.org`
 * @dependencies `github.com/thkukuk/libnsl`, `sourceforge.net/libtirpc`, `github.com/besser82/libxcrypt`
 * @buildDependencies `gnu.org/gcc`, `gnu.org/make`, `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.linuxpamorg
 * console.log(pkg.name)        // "linux-pam"
 * console.log(pkg.description) // "Linux PAM (Pluggable Authentication Modules for..."
 * console.log(pkg.programs)    // ["faillock", "mkhomedir_helper", ...]
 * console.log(pkg.versions[0]) // "1.7.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/linux-pam-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const linuxpamorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'linux-pam' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'linux-pam.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Linux PAM (Pluggable Authentication Modules for Linux) project' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/linux-pam.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/linux-pam/linux-pam' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install linux-pam.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +linux-pam.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install linux-pam.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'faillock',
    'mkhomedir_helper',
    'pam_namespace_helper',
    'pam_timestamp_check',
    'unix_chkpwd',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'github.com/thkukuk/libnsl',
    'sourceforge.net/libtirpc',
    'github.com/besser82/libxcrypt',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gcc',
    'gnu.org/make',
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.3',
  ] as const,
  aliases: [] as const,
}

export type LinuxpamorgPackage = typeof linuxpamorgPackage
