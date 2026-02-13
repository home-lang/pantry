/**
 * **huggingface/cli** - The official Python client for the Huggingface Hub.
 *
 * @domain `huggingface.co`
 * @programs `huggingface-cli`
 * @version `1.3.3` (89 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install huggingface.co`
 * @homepage https://huggingface.co/docs/huggingface_hub/index
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.huggingfaceco
 * console.log(pkg.name)        // "huggingface/cli"
 * console.log(pkg.description) // "The official Python client for the Huggingface ..."
 * console.log(pkg.programs)    // ["huggingface-cli"]
 * console.log(pkg.versions[0]) // "1.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/huggingface-co.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const huggingfacecoPackage = {
  /**
   * The display name of this package.
   */
  name: 'huggingface/cli' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'huggingface.co' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The official Python client for the Huggingface Hub.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/huggingface.co/package.yml' as const,
  homepageUrl: 'https://huggingface.co/docs/huggingface_hub/index' as const,
  githubUrl: 'https://github.com/huggingface/huggingface_hub' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install huggingface.co' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +huggingface.co -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install huggingface.co' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'huggingface-cli',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.4',
    '1.2.3',
    '1.2.2',
    '1.2.0',
    '1.1.7',
    '1.1.6',
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.36.0',
    '0.35.3',
    '0.35.2',
    '0.35.1',
    '0.35.0',
    '0.34.6',
    '0.34.5',
    '0.34.4',
    '0.34.3',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.5',
    '0.33.4',
    '0.33.3',
    '0.33.2',
    '0.33.1',
    '0.33.0',
    '0.32.6',
    '0.32.5',
    '0.32.4',
    '0.32.3',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.4',
    '0.31.2',
    '0.31.0',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.3',
    '0.29.2',
    '0.29.1',
    '0.29.0',
    '0.28.1',
    '0.28.0',
    '0.27.1',
    '0.27.0',
    '0.26.5',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.7',
    '0.24.6',
    '0.24.5',
    '0.24.4',
    '0.24.3',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.5',
    '0.23.4',
    '0.23.3',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.4',
    '0.21.3',
    '0.21.2',
    '0.21.0',
    '0.20.3',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.4',
  ] as const,
  aliases: [] as const,
}

export type HuggingfacecoPackage = typeof huggingfacecoPackage
