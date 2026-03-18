/**
 * **cli** - pkgx package
 *
 * @domain `kiro.dev/cli`
 * @programs `kiro-cli`
 * @version `1.27.3` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install kiro.dev/cli`
 * @dependencies `curl.se`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.kirodevcli
 * console.log(pkg.name)        // "cli"
 * console.log(pkg.programs)    // ["kiro-cli"]
 * console.log(pkg.versions[0]) // "1.27.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/kiro-dev/cli.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const kirodevcliPackage = {
  /**
  * The display name of this package.
  */
  name: 'cli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kiro.dev/cli' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kiro.dev/cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install kiro.dev/cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kiro.dev/cli -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install kiro.dev/cli' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kiro-cli',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.27.3',
    '1.27.2',
    '1.27.1',
    '1.27.0',
    '1.26.2',
  ] as const,
  aliases: [] as const,
}

export type KirodevcliPackage = typeof kirodevcliPackage
