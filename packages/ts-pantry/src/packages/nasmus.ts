/**
 * **nasm.us** - A cross-platform x86 assembler with an Intel-like syntax
 *
 * @domain `nasm.us`
 * @programs `nasm`, `ndisasm`
 * @version `3.1.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install nasm.us`
 * @homepage https://www.nasm.us/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.nasmus
 * console.log(pkg.name)        // "nasm.us"
 * console.log(pkg.description) // "A cross-platform x86 assembler with an Intel-li..."
 * console.log(pkg.programs)    // ["nasm", "ndisasm"]
 * console.log(pkg.versions[0]) // "3.1.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/nasm-us.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install nasm.us' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nasm.us -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install nasm.us' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.01',
    '3.1.0',
    '3.00',
    '3.0.0',
    '2.16.03',
    '2.16.3',
    '2.16.02',
    '2.16.2',
    '2.16.01',
    '2.16',
    '2.15.05',
    '2.15.5',
    '2.15.04',
    '2.15.03',
    '2.15.02',
    '2.15.01',
    '2.15',
    '2.14.02',
    '2.14.01',
    '2.14',
    '2.13.03',
    '2.13.02',
    '2.13.01',
    '2.13',
    '2.12.02',
    '2.12.01',
    '2.12',
    '2.11.08',
    '2.11.06',
    '2.11.05',
    '2.11.04',
    '2.11.03',
    '2.11.02',
    '2.11.01',
    '2.11',
    '2.10.09',
    '2.10.08',
    '2.10.07',
    '2.10.06',
    '2.10.05',
    '2.10.04',
    '2.10.03',
    '2.10.02',
    '2.10.01',
    '2.10',
    '2.09.10',
    '2.09.09',
    '2.09.08',
    '2.09.07',
    '2.09.06',
    '2.09.05',
    '2.09.04',
    '2.09.03',
    '2.09.02',
    '2.09.01',
    '2.09',
    '2.08.02',
    '2.08.01',
    '2.08',
    '2.07',
    '2.06',
    '2.05.01',
    '2.05',
    '2.04',
    '2.03.01',
    '2.03',
    '2.02',
    '2.01',
    '2.00',
    '0.99.06',
    '0.99.05',
  ] as const,
  aliases: [] as const,
}

export type NasmusPackage = typeof nasmusPackage
