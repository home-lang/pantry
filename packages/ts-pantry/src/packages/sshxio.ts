/**
 * **sshx** - Fast, collaborative live terminal sharing over the web
 *
 * @domain `sshx.io`
 * @programs `sshx`
 * @version `2023.11.14` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sshx.io`
 * @homepage https://sshx.io
 * @dependencies `protobuf.dev`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sshxio
 * console.log(pkg.name)        // "sshx"
 * console.log(pkg.description) // "Fast, collaborative live terminal sharing over ..."
 * console.log(pkg.programs)    // ["sshx"]
 * console.log(pkg.versions[0]) // "2023.11.14" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sshx-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sshxioPackage = {
  /**
  * The display name of this package.
  */
  name: 'sshx' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sshx.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Fast, collaborative live terminal sharing over the web' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sshx.io/package.yml' as const,
  homepageUrl: 'https://sshx.io' as const,
  githubUrl: 'https://github.com/ekzhang/sshx' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sshx.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sshx.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install sshx.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sshx',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'protobuf.dev',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2023.11.14',
    '0.4.1',
    '0.4.0',
    '0.3.1',
    '0.3.0',
    '0.2.5',
    '0.2.4',
    '0.2.3',
  ] as const,
  aliases: [] as const,
}

export type SshxioPackage = typeof sshxioPackage
