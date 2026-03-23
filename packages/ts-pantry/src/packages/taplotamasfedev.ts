/**
 * **taplo** - A TOML toolkit written in Rust
 *
 * @domain `taplo.tamasfe.dev`
 * @programs `taplo`
 * @version `0.10.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install taplo.tamasfe.dev`
 * @homepage https://taplo.tamasfe.dev
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.taplotamasfedev
 * console.log(pkg.name)        // "taplo"
 * console.log(pkg.description) // "A TOML toolkit written in Rust"
 * console.log(pkg.programs)    // ["taplo"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/taplo-tamasfe-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const taplotamasfedevPackage = {
  /**
  * The display name of this package.
  */
  name: 'taplo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'taplo.tamasfe.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A TOML toolkit written in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/taplo.tamasfe.dev/package.yml' as const,
  homepageUrl: 'https://taplo.tamasfe.dev' as const,
  githubUrl: 'https://github.com/tamasfe/taplo' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install taplo.tamasfe.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +taplo.tamasfe.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install taplo.tamasfe.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'taplo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    'release-taplo-0.13.0',
    '0.10.0',
    '0.9.3',
    '0.9.2',
    'release-taplo-cli-0.9.0',
    '0.8.1',
    '0.8.0',
    '0.7.2',
    'release-taplo-cli-0.7.0',
    'release-taplo-cli-0.6.8',
    'release-taplo-cli-0.6.7',
    'release-cli-0.6.3',
    'release-cli-0.6.2',
    'release-cli-0.6.1',
    'release-cli-0.6.0',
    'release-cli-0.5.0',
    'release-cli-0.4.1',
    'release-lsp-0.2.6',
    'release-lsp-0.2.5',
    'release-taplo__core-0.2.0',
  ] as const,
  aliases: [] as const,
}

export type TaplotamasfedevPackage = typeof taplotamasfedevPackage
