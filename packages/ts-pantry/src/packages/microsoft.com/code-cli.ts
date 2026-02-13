/**
 * **vscode cli** - Command-line interface built-in Visual Studio Code
 *
 * @domain `microsoft.com/code-cli`
 * @programs `code`
 * @version `1.108.1` (36 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install microsoft.com/code-cli`
 * @homepage https://code.visualstudio.com
 * @dependencies `openssl.org@1.1`, `zlib.net@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.microsoftcomcodecli
 * console.log(pkg.name)        // "vscode cli"
 * console.log(pkg.description) // "Command-line interface built-in Visual Studio Code"
 * console.log(pkg.programs)    // ["code"]
 * console.log(pkg.versions[0]) // "1.108.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/microsoft-com/code-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const microsoftcomcodecliPackage = {
  /**
   * The display name of this package.
   */
  name: 'vscode cli' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'microsoft.com/code-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line interface built-in Visual Studio Code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/code-cli/package.yml' as const,
  homepageUrl: 'https://code.visualstudio.com' as const,
  githubUrl: 'https://github.com/microsoft/vscode' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install microsoft.com/code-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +microsoft.com/code-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install microsoft.com/code-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'code',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org@1.1',
    'zlib.net@1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.108.1',
    '1.108.0',
    '1.107.1',
    '1.107.0',
    '1.106.3',
    '1.106.2',
    '1.106.1',
    '1.106.0',
    '1.105.1',
    '1.105.0',
    '1.104.3',
    '1.104.2',
    '1.104.1',
    '1.104.0',
    '1.103.2',
    '1.103.1',
    '1.103.0',
    '1.102.3',
    '1.102.2',
    '1.102.1',
    '1.102.0',
    '1.101.2',
    '1.101.1',
    '1.101.0',
    '1.100.3',
    '1.100.2',
    '1.100.1',
    '1.100.0',
    '1.99.3',
    '1.99.2',
    '1.99.1',
    '1.99.0',
    '1.98.2',
    '1.98.1',
    '1.98.0',
    '1.97.2',
  ] as const,
  aliases: [] as const,
}

export type MicrosoftcomcodecliPackage = typeof microsoftcomcodecliPackage
