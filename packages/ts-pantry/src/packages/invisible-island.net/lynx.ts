/**
 * **lynx** - Text-based web browser
 *
 * @domain `invisible-island.net/lynx`
 * @programs `lynx`
 * @version `2.9.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install invisible-island.net/lynx`
 * @homepage https://invisible-island.net/lynx/
 * @dependencies `openssl.org^3`, `invisible-island.net/ncurses^6`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.invisibleislandnetlynx
 * console.log(pkg.name)        // "lynx"
 * console.log(pkg.description) // "Text-based web browser"
 * console.log(pkg.programs)    // ["lynx"]
 * console.log(pkg.versions[0]) // "2.9.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/invisible-island-net/lynx.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const invisibleislandnetlynxPackage = {
  /**
  * The display name of this package.
  */
  name: 'lynx' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'invisible-island.net/lynx' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Text-based web browser' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/lynx/package.yml' as const,
  homepageUrl: 'https://invisible-island.net/lynx/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install invisible-island.net/lynx' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +invisible-island.net/lynx -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install invisible-island.net/lynx' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'lynx',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^3',
    'invisible-island.net/ncurses^6',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.9.2',
  ] as const,
  aliases: [] as const,
}

export type InvisibleislandnetlynxPackage = typeof invisibleislandnetlynxPackage
