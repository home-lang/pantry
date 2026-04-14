/**
 * **soliditylang** - Solidity, the Smart Contract Programming Language
 *
 * @domain `soliditylang.org`
 * @programs `solc`, `yul-phaser`
 * @version `0.8.34` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install soliditylang.org`
 * @homepage https://soliditylang.org
 * @dependencies `boost.org~1.84`, `linux:gnu.org/gcc/libstdcxx@14` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `linux:gnu.org/gcc@14`, `cmake.org@3`, `gnu.org/patch` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.soliditylangorg
 * console.log(pkg.name)        // "soliditylang"
 * console.log(pkg.description) // "Solidity, the Smart Contract Programming Language"
 * console.log(pkg.programs)    // ["solc", "yul-phaser"]
 * console.log(pkg.versions[0]) // "0.8.34" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/soliditylang-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const soliditylangorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'soliditylang' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'soliditylang.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Solidity, the Smart Contract Programming Language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/soliditylang.org/package.yml' as const,
  homepageUrl: 'https://soliditylang.org' as const,
  githubUrl: 'https://github.com/ethereum/solidity' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install soliditylang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +soliditylang.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install soliditylang.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'solc',
    'yul-phaser',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'boost.org~1.84',
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc@14',
    'cmake.org@3',
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.8.34',
    '0.8.33',
    '0.8.32',
    '0.8.31',
    '0.8.30',
    '0.8.29',
    '0.8.28',
    '0.8.27',
    '0.8.26',
    '0.8.25',
    '0.8.24',
    '0.8.23',
    '0.8.22',
    '0.8.21',
    '0.8.20',
    '0.8.19',
    '0.8.18',
    '0.8.17',
    '0.8.16',
    '0.8.15',
    '0.8.14',
    '0.8.13',
    '0.8.12',
    '0.8.11',
    '0.8.10',
    '0.8.9',
    '0.8.8',
    '0.8.7',
    '0.8.6',
    '0.8.5',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.6',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.12',
    '0.6.11',
    '0.6.10',
    '0.6.9',
    '0.6.8',
  ] as const,
  aliases: [] as const,
}

export type SoliditylangorgPackage = typeof soliditylangorgPackage
