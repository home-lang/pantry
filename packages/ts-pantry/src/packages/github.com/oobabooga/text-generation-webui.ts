/**
 * **text generation web UI** - A Gradio web UI for Large Language Models with support for multiple inference backends.
 *
 * @domain `github.com/oobabooga/text-generation-webui`
 * @programs `text-generation-webui`
 * @version `3.23.0` (55 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/oobabooga/text-generation-webui`
 * @dependencies `python.org~3.10`, `pkgx.sh^1`
 * @buildDependencies `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomoobaboogatextgenerationwebui
 * console.log(pkg.name)        // "text generation web UI"
 * console.log(pkg.description) // "A Gradio web UI for Large Language Models with ..."
 * console.log(pkg.programs)    // ["text-generation-webui"]
 * console.log(pkg.versions[0]) // "3.23.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/oobabooga/text-generation-webui.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const textgenerationwebuiPackage = {
  /**
   * The display name of this package.
   */
  name: 'text generation web UI' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/oobabooga/text-generation-webui' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A Gradio web UI for Large Language Models with support for multiple inference backends.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/oobabooga/text-generation-webui/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/oobabooga/text-generation-webui' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/oobabooga/text-generation-webui' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/oobabooga/text-generation-webui -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/oobabooga/text-generation-webui' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'text-generation-webui',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.10',
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/coreutils',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.23.0',
    '3.22.0',
    '3.21.0',
    '3.20.0',
    '3.19.0',
    '3.18.0',
    '3.17.0',
    '3.16.0',
    '3.15.0',
    '3.14.0',
    '3.13.0',
    '3.12.0',
    '3.11.0',
    '3.10.0',
    '3.9.1',
    '3.9.0',
    '3.8.0',
    '3.7.1',
    '3.7.0',
    '3.6.1',
    '3.6.0',
    '3.5.0',
    '3.4.1',
    '3.4.0',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.0',
    '2.8.1',
    '2.8.0',
    '2.7.0',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.0',
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.0',
    '1.10.1',
    '1.10.0',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.0',
  ] as const,
  aliases: [] as const,
}

export type TextgenerationwebuiPackage = typeof textgenerationwebuiPackage
