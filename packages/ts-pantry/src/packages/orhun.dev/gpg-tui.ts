/**
 * **gpg-tui** - Manage your GnuPG keys with ease! 🔐
 *
 * @domain `orhun.dev/gpg-tui`
 * @programs `gpg-tui`
 * @version `0.11.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install orhun.dev/gpg-tui`
 * @homepage https://blog.orhun.dev/introducing-gpg-tui/
 * @dependencies `gnupg.org`, `gnupg.org/gpgme^1.12`, `gnupg.org/libgpg-error`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.orhundevgpgtui
 * console.log(pkg.name)        // "gpg-tui"
 * console.log(pkg.description) // "Manage your GnuPG keys with ease! 🔐"
 * console.log(pkg.programs)    // ["gpg-tui"]
 * console.log(pkg.versions[0]) // "0.11.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/orhun-dev/gpg-tui.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const orhundevgpgtuiPackage = {
  /**
  * The display name of this package.
  */
  name: 'gpg-tui' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'orhun.dev/gpg-tui' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Manage your GnuPG keys with ease! 🔐' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/orhun.dev/gpg-tui/package.yml' as const,
  homepageUrl: 'https://blog.orhun.dev/introducing-gpg-tui/' as const,
  githubUrl: 'https://github.com/orhun/gpg-tui' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install orhun.dev/gpg-tui' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +orhun.dev/gpg-tui -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install orhun.dev/gpg-tui' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gpg-tui',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnupg.org',
    'gnupg.org/gpgme^1.12',
    'gnupg.org/libgpg-error',
    'x.org/xcb',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.11.1',
    '0.11.0',
    '0.10.0',
  ] as const,
  aliases: [] as const,
}

export type OrhundevgpgtuiPackage = typeof orhundevgpgtuiPackage
