/**
 * **openclaw** - pkgx package
 *
 * @domain `github.com/openclaw/openclaw`
 * @version `2026.2.25` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/openclaw/openclaw`
 * @dependencies `nodejs.org`, `github.com/mikefarah/yq`, `stedolan.github.io/jq`, ... (+1 more)
 * @buildDependencies `nodejs.org`, `npmjs.com`, `linux:cmake.org@3` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomopenclawopenclaw
 * console.log(pkg.name)        // "openclaw"
 * console.log(pkg.versions[0]) // "2026.2.25" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/openclaw/openclaw.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/openclaw/openclaw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/openclaw/openclaw -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/openclaw/openclaw' as const,
  programs: [] as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.2.25',
  ] as const,
  aliases: [] as const,
}

export type OpenclawPackage = typeof openclawPackage
