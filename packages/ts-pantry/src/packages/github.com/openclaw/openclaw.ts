/**
 * **openclaw** - pkgx package
 *
 * @domain `github.com/openclaw/openclaw`
 * @programs `openclaw`, `openclaw-init`
 * @version `2026.3.22` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/openclaw/openclaw`
 * @dependencies `nodejs.org`, `github.com/mikefarah/yq`, `stedolan.github.io/jq`, ... (+1 more)
 * @buildDependencies `nodejs.org`, `npmjs.com`, `linux:cmake.org@3` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomopenclawopenclaw
 * console.log(pkg.name)        // "openclaw"
 * console.log(pkg.programs)    // ["openclaw", "openclaw-init"]
 * console.log(pkg.versions[0]) // "2026.3.22" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/openclaw/openclaw.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const openclawPackage = {
  /**
  * The display name of this package.
  */
  name: 'openclaw' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/openclaw/openclaw' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/openclaw/openclaw/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/openclaw/openclaw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/openclaw/openclaw -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/openclaw/openclaw' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'openclaw',
    'openclaw-init',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org',
    'github.com/mikefarah/yq',
    'stedolan.github.io/jq',
    'gnu.org/sed',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'nodejs.org',
    'npmjs.com',
    'linux:cmake.org@3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.3.22',
    '2026.3.13',
    '2026.3.12',
    '2026.3.11',
    '2026.3.8',
    '2026.3.7',
    '2026.3.2',
    '2026.3.1',
    '2026.2.26',
    '2026.2.25',
  ] as const,
  aliases: [] as const,
}

export type OpenclawPackage = typeof openclawPackage
