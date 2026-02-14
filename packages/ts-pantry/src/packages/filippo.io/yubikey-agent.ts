/**
 * **yubikey-agent** - Seamless ssh-agent for YubiKeys and other PIV tokens
 *
 * @domain `filippo.io/yubikey-agent`
 * @programs `yubikey-agent`
 * @version `0.1.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install filippo.io/yubikey-agent`
 * @homepage https://filippo.io/yubikey-agent
 * @dependencies `pcsclite.apdu.fr^2`, `linux:gnupg.org/pinentry` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.filippoioyubikeyagent
 * console.log(pkg.name)        // "yubikey-agent"
 * console.log(pkg.description) // "Seamless ssh-agent for YubiKeys and other PIV t..."
 * console.log(pkg.programs)    // ["yubikey-agent"]
 * console.log(pkg.versions[0]) // "0.1.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/filippo-io/yubikey-agent.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const filippoioyubikeyagentPackage = {
  /**
  * The display name of this package.
  */
  name: 'yubikey-agent' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'filippo.io/yubikey-agent' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Seamless ssh-agent for YubiKeys and other PIV tokens' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/filippo.io/yubikey-agent/package.yml' as const,
  homepageUrl: 'https://filippo.io/yubikey-agent' as const,
  githubUrl: 'https://github.com/FiloSottile/yubikey-agent' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install filippo.io/yubikey-agent' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +filippo.io/yubikey-agent -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install filippo.io/yubikey-agent' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'yubikey-agent',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'pcsclite.apdu.fr^2',
    'linux:gnupg.org/pinentry',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.6',
  ] as const,
  aliases: [] as const,
}

export type FilippoioyubikeyagentPackage = typeof filippoioyubikeyagentPackage
