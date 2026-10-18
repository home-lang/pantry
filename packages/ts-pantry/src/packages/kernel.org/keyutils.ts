/**
 * **libkeyutils** - Linux key retention client library and development interface.
 *
 * @domain `kernel.org/keyutils`
 * @version `1.6.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install kernel.org/keyutils`
 * @name `libkeyutils`
 * @homepage https://kernel.googlesource.com/pub/scm/linux/kernel/git/dhowells/keyutils/
 * @buildDependencies `gnu.org/make`, `gnu.org/sed`, `gnu.org/coreutils`, ... (+3 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access the package
 * const pkg = pantry.libkeyutils
 * // Or access via domain
 * const samePkg = pantry.kernelorgkeyutils
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "libkeyutils"
 * console.log(pkg.description) // "Linux key retention client library and developm..."
 * console.log(pkg.versions[0]) // "1.6.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/kernel-org/keyutils.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const libkeyutilsPackage = {
  /**
  * The display name of this package.
  */
  name: 'libkeyutils' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kernel.org/keyutils' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Linux key retention client library and development interface.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://kernel.googlesource.com/pub/scm/linux/kernel/git/dhowells/keyutils/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install kernel.org/keyutils' as const,
  pantryInstallCommand: 'pantry install kernel.org/keyutils' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
    'gnu.org/sed',
    'gnu.org/coreutils',
    'gnu.org/binutils',
    'freedesktop.org/pkg-config',
    'kernel.org/linux-headers',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.3',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type LibkeyutilsPackage = typeof libkeyutilsPackage
