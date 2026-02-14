/**
 * **Stable Diffusion web UI** - Stable Diffusion web UI
 *
 * @domain `github.com/AUTOMATIC1111/stable-diffusion-webui`
 * @programs `stable-diffusion-webui`
 * @version `1.10.1` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/AUTOMATIC1111/stable-diffusion-webui`
 * @dependencies `python.org~3.10`, `tea.xyz^0  # our scripts use tea/cli`, `git-scm.org^2`
 * @buildDependencies `pip.pypa.io`, `gnu.org/wget`, `protobuf.dev@>=21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomautomatic1111stablediffusionwebui
 * console.log(pkg.name)        // "Stable Diffusion web UI"
 * console.log(pkg.description) // "Stable Diffusion web UI"
 * console.log(pkg.programs)    // ["stable-diffusion-webui"]
 * console.log(pkg.versions[0]) // "1.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/AUTOMATIC1111/stable-diffusion-webui.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const stablediffusionwebuiPackage = {
  /**
  * The display name of this package.
  */
  name: 'Stable Diffusion web UI' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/AUTOMATIC1111/stable-diffusion-webui' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Stable Diffusion web UI' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AUTOMATIC1111/stable-diffusion-webui/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/AUTOMATIC1111/stable-diffusion-webui' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/AUTOMATIC1111/stable-diffusion-webui -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/AUTOMATIC1111/stable-diffusion-webui' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'stable-diffusion-webui',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.10',
    'tea.xyz^0  # our scripts use tea/cli',
    'git-scm.org^2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'pip.pypa.io',
    'gnu.org/wget',
    'protobuf.dev@>=21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.10.1',
    '1.10.0',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.0',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type StablediffusionwebuiPackage = typeof stablediffusionwebuiPackage
