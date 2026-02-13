/**
 * **gitleaks** - Find secrets with Gitleaks 🔑
 *
 * @domain `gitleaks.io`
 * @programs `gitleaks`
 * @version `8.30.0` (33 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gitleaks.io`
 * @homepage https://gitleaks.io
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitleaksio
 * console.log(pkg.name)        // "gitleaks"
 * console.log(pkg.description) // "Find secrets with Gitleaks 🔑"
 * console.log(pkg.programs)    // ["gitleaks"]
 * console.log(pkg.versions[0]) // "8.30.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gitleaks-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitleaksioPackage = {
  /**
   * The display name of this package.
   */
  name: 'gitleaks' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gitleaks.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Find secrets with Gitleaks 🔑' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gitleaks.io/package.yml' as const,
  homepageUrl: 'https://gitleaks.io' as const,
  githubUrl: 'https://github.com/gitleaks/gitleaks' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gitleaks.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gitleaks.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gitleaks.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gitleaks',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.30.0',
    '8.29.1',
    '8.29.0',
    '8.28.0',
    '8.27.2',
    '8.27.1',
    '8.27.0',
    '8.26.0',
    '8.25.1',
    '8.25.0',
    '8.24.3',
    '8.24.2',
    '8.24.0',
    '8.23.3',
    '8.23.2',
    '8.23.1',
    '8.23.0',
    '8.22.1',
    '8.22.0',
    '8.21.4',
    '8.21.3',
    '8.21.2',
    '8.21.1',
    '8.21.0',
    '8.20.1',
    '8.20.0',
    '8.19.3',
    '8.19.2',
    '8.19.1',
    '8.18.4',
    '8.18.3',
    '8.18.2',
    '8.18.1',
  ] as const,
  aliases: [] as const,
}

export type GitleaksioPackage = typeof gitleaksioPackage
