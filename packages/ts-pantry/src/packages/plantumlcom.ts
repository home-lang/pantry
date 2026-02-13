/**
 * **plantuml** - Generate diagrams from textual description
 *
 * @domain `plantuml.com`
 * @programs `plantuml`
 * @version `1.2026.1` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install plantuml.com`
 * @homepage https://plantuml.com/
 * @dependencies `graphviz.org`, `openjdk.org`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.plantumlcom
 * console.log(pkg.name)        // "plantuml"
 * console.log(pkg.description) // "Generate diagrams from textual description"
 * console.log(pkg.programs)    // ["plantuml"]
 * console.log(pkg.versions[0]) // "1.2026.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/plantuml-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const plantumlcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'plantuml' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'plantuml.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generate diagrams from textual description' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/plantuml.com/package.yml' as const,
  homepageUrl: 'https://plantuml.com/' as const,
  githubUrl: 'https://github.com/plantuml/plantuml' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install plantuml.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +plantuml.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install plantuml.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'plantuml',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'graphviz.org',
    'openjdk.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2026.1',
    '1.2026.0',
    '1.2025.10',
    '1.2025.9',
    '1.2025.8',
    '1.2025.7',
    '1.2025.6',
    '1.2025.5',
    '1.2025.4',
    '1.2025.3',
    '1.2025.2',
    '1.2025.1',
    '1.2025.0',
    '1.2024.8',
    '1.2024.7',
    '1.2024.6',
    '1.2024.5',
    '1.2024.4',
    '1.2024.3',
    '1.2024.2',
    '1.2024.1',
    '1.2024.0',
    '1.2023.13',
    '1.2023.12',
    '1.2023.11',
    '1.2023.10',
  ] as const,
  aliases: [] as const,
}

export type PlantumlcomPackage = typeof plantumlcomPackage
