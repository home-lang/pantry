/**
 * **chatblade** - A CLI Swiss Army Knife for ChatGPT
 *
 * @domain `github.com/npiv/chatblade`
 * @programs `chatblade`
 * @version `0.7.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/npiv/chatblade`
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnpivchatblade
 * console.log(pkg.name)        // "chatblade"
 * console.log(pkg.description) // "A CLI Swiss Army Knife for ChatGPT"
 * console.log(pkg.programs)    // ["chatblade"]
 * console.log(pkg.versions[0]) // "0.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/npiv/chatblade.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const chatbladePackage = {
  /**
   * The display name of this package.
   */
  name: 'chatblade' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/npiv/chatblade' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A CLI Swiss Army Knife for ChatGPT' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/npiv/chatblade/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/npiv/chatblade' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/npiv/chatblade' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/npiv/chatblade -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/npiv/chatblade' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'chatblade',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.0',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.5.0',
    '0.4.0',
    '0.3.4',
    '0.3.3',
    '0.3.1',
    '0.3.0',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.1',
  ] as const,
  aliases: [] as const,
}

export type ChatbladePackage = typeof chatbladePackage
