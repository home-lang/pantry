/**
 * **pdm** - A modern Python package and dependency manager supporting the latest PEP standards
 *
 * @domain `pdm.fming.dev`
 * @programs `pdm`
 * @version `2.26.6` (81 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pdm.fming.dev`
 * @homepage https://pdm.fming.dev
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pdmfmingdev
 * console.log(pkg.name)        // "pdm"
 * console.log(pkg.description) // "A modern Python package and dependency manager ..."
 * console.log(pkg.programs)    // ["pdm"]
 * console.log(pkg.versions[0]) // "2.26.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pdm-fming-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pdmfmingdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'pdm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pdm.fming.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A modern Python package and dependency manager supporting the latest PEP standards' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pdm.fming.dev/package.yml' as const,
  homepageUrl: 'https://pdm.fming.dev' as const,
  githubUrl: 'https://github.com/pdm-project/pdm' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pdm.fming.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pdm.fming.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pdm.fming.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pdm',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.26.6',
    '2.26.5',
    '2.26.4',
    '2.26.3',
    '2.26.2',
    '2.26.1',
    '2.26.0',
    '2.25.9',
    '2.25.7',
    '2.25.6',
    '2.25.5',
    '2.25.4',
    '2.25.3',
    '2.25.2',
    '2.25.1',
    '2.25.0',
    '2.24.2',
    '2.24.1',
    '2.24.0',
    '2.23.1',
    '2.23.0',
    '2.22.4',
    '2.22.3',
    '2.22.2',
    '2.22.1',
    '2.22.0',
    '2.21.0',
    '2.20.1',
    '2.20.0',
    '2.19.3',
    '2.19.2',
    '2.19.1',
    '2.19.0',
    '2.18.2',
    '2.18.1',
    '2.18.0',
    '2.17.3',
    '2.17.2',
    '2.17.1',
    '2.17.0',
    '2.16.1',
    '2.16.0',
    '2.15.4',
    '2.15.3',
    '2.15.2',
    '2.15.1',
    '2.15.0',
    '2.14.0',
    '2.13.3',
    '2.13.2',
    '2.13.1',
    '2.13.0',
    '2.12.4',
    '2.12.3',
    '2.12.2',
    '2.12.1',
    '2.12.0',
    '2.11.2',
    '2.11.1',
    '2.11.0',
    '2.10.4',
    '2.10.3',
    '2.10.2',
    '2.10.1',
    '2.10.0',
    '2.9.3',
    '2.9.2',
    '2.9.1',
    '2.9.0',
    '2.8.2',
    '2.8.1',
    '2.8.0',
    '2.7.4',
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.1',
    '2.6.0',
    '2.5.6',
    '2.5.3',
  ] as const,
  aliases: [] as const,
}

export type PdmfmingdevPackage = typeof pdmfmingdevPackage
