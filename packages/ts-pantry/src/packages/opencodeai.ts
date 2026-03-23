/**
 * **opencode.ai** - pkgx package
 *
 * @domain `opencode.ai`
 * @programs `opencode`
 * @version `1.3.0` (510 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install opencode.ai`
 * @buildDependencies `stedolan.github.io/jq`, `pkgx.sh`, `go.dev@^1.24`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.opencodeai
 * console.log(pkg.name)        // "opencode.ai"
 * console.log(pkg.programs)    // ["opencode"]
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/opencode-ai.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const opencodeaiPackage = {
  /**
  * The display name of this package.
  */
  name: 'opencode.ai' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'opencode.ai' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opencode.ai/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install opencode.ai' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opencode.ai -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install opencode.ai' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'opencode',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'stedolan.github.io/jq',
    'pkgx.sh',
    'go.dev@^1.24',
    'python.org@3',
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.0',
    '1.2.27',
    '1.2.26',
    '1.2.25',
    '1.2.24',
    '1.2.23',
    '1.2.22',
    '1.2.21',
    '1.2.20',
    '1.2.19',
    '1.2.18',
    '1.2.17',
    '1.2.16',
    '1.2.15',
    '1.2.14',
    '1.2.13',
    '1.2.12',
    '1.2.11',
    '1.2.10',
    '1.2.9',
  ] as const,
  aliases: [] as const,
}

export type OpencodeaiPackage = typeof opencodeaiPackage
