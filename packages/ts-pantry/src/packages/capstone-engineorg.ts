/**
 * **cstool** - Capstone disassembly/disassembler framework for ARM, ARM64 (ARMv8), Alpha, BPF, Ethereum VM, HPPA, LoongArch, M68K, M680X, Mips, MOS65XX, PPC, RISC-V(rv32G/rv64G), SH, Sparc, SystemZ, TMS320C64X, TriCore, Webassembly, XCore and X86.
 *
 * @domain `capstone-engine.org`
 * @programs `cstool`
 * @version `5.0.6` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install capstone-engine.org`
 * @homepage https://www.capstone-engine.org/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.capstoneengineorg
 * console.log(pkg.name)        // "cstool"
 * console.log(pkg.description) // "Capstone disassembly/disassembler framework for..."
 * console.log(pkg.programs)    // ["cstool"]
 * console.log(pkg.versions[0]) // "5.0.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/capstone-engine-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const capstoneengineorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'cstool' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'capstone-engine.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Capstone disassembly/disassembler framework for ARM, ARM64 (ARMv8), Alpha, BPF, Ethereum VM, HPPA, LoongArch, M68K, M680X, Mips, MOS65XX, PPC, RISC-V(rv32G/rv64G), SH, Sparc, SystemZ, TMS320C64X, TriCore, Webassembly, XCore and X86.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/capstone-engine.org/package.yml' as const,
  homepageUrl: 'https://www.capstone-engine.org/' as const,
  githubUrl: 'https://github.com/capstone-engine/capstone' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install capstone-engine.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +capstone-engine.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install capstone-engine.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cstool',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.0.6',
    '5.0.5',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0.0',
    '4.0.2',
  ] as const,
  aliases: [] as const,
}

export type CapstoneengineorgPackage = typeof capstoneengineorgPackage
