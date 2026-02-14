/**
 * **nasm.us** - A cross-platform x86 assembler with an Intel-like syntax
 *
 * @domain `nasm.us`
 * @programs `nasm`, `ndisasm`
 * @version `3.1.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nasm.us`
 * @homepage https://www.nasm.us/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nasmus
 * console.log(pkg.name)        // "nasm.us"
 * console.log(pkg.description) // "A cross-platform x86 assembler with an Intel-li..."
 * console.log(pkg.programs)    // ["nasm", "ndisasm"]
 * console.log(pkg.versions[0]) // "3.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nasm-us.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nasmusPackage = {
  /**
  * The display name of this package.
  */
  name: 'nasm.us' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'nasm.us' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A cross-platform x86 assembler with an Intel-like syntax' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nasm.us/package.yml' as const,
  homepageUrl: 'https://www.nasm.us/' as const,
  githubUrl: 'https://github.com/netwide-assembler/nasm' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install nasm.us' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nasm.us -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nasm.us' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'nasm',
    'ndisasm',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.1.0',
    '3.0.0',
    '2.16.3',
    '2.16.2',
    '2.15.5',
  ] as const,
  aliases: [] as const,
}

export type NasmusPackage = typeof nasmusPackage
