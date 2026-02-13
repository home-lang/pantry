/**
 * **Auto-GPT** - AutoGPT is the vision of accessible AI for everyone, to use and to build on. Our mission is to provide the tools, so that you can focus on what matters.
 *
 * @domain `agpt.co`
 * @programs `auto-gpt`
 * @version `0.4.7` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install agpt.co`
 * @homepage https://agpt.co
 * @dependencies `python.org>=3.10<3.12`, `redis.io^7`, `tea.xyz^0`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.agptco
 * console.log(pkg.name)        // "Auto-GPT"
 * console.log(pkg.description) // "AutoGPT is the vision of accessible AI for ever..."
 * console.log(pkg.programs)    // ["auto-gpt"]
 * console.log(pkg.versions[0]) // "0.4.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/agpt-co.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const agptcoPackage = {
  /**
   * The display name of this package.
   */
  name: 'Auto-GPT' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'agpt.co' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'AutoGPT is the vision of accessible AI for everyone, to use and to build on. Our mission is to provide the tools, so that you can focus on what matters.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/agpt.co/package.yml' as const,
  homepageUrl: 'https://agpt.co' as const,
  githubUrl: 'https://github.com/Significant-Gravitas/Auto-GPT' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install agpt.co' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +agpt.co -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install agpt.co' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'auto-gpt',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.10<3.12',
    'redis.io^7',
    'tea.xyz^0',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.7',
    '0.4.6',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.0',
    '0.3.1',
    '0.3.0',
  ] as const,
  aliases: [] as const,
}

export type AgptcoPackage = typeof agptcoPackage
