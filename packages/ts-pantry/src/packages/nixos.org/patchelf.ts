/**
 * **patchelf** - A small utility to modify the dynamic linker and RPATH of ELF executables
 *
 * @domain `nixos.org/patchelf`
 * @programs `patchelf`
 * @version `0.18.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nixos.org/patchelf`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nixosorgpatchelf
 * console.log(pkg.name)        // "patchelf"
 * console.log(pkg.description) // "A small utility to modify the dynamic linker an..."
 * console.log(pkg.programs)    // ["patchelf"]
 * console.log(pkg.versions[0]) // "0.18.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nixos-org/patchelf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nixosorgpatchelfPackage = {
  /**
  * The display name of this package.
  */
  name: 'patchelf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'nixos.org/patchelf' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A small utility to modify the dynamic linker and RPATH of ELF executables' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nixos.org/patchelf/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/NixOS/patchelf' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install nixos.org/patchelf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nixos.org/patchelf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nixos.org/patchelf' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'patchelf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.18.0',
    '0.17.2',
    '0.17.0',
    '0.15.5',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
  ] as const,
  aliases: [] as const,
}

export type NixosorgpatchelfPackage = typeof nixosorgpatchelfPackage
