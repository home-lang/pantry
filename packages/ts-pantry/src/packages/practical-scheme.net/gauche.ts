/**
 * **gauche** - R7RS Scheme implementation, developed to be a handy script interpreter
 *
 * @domain `practical-scheme.net/gauche`
 * @programs `gauche-cesconv`, `gauche-config`, `gauche-install`, `gauche-package`, `gosh`
 * @version `0.9.15` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install practical-scheme.net/gauche`
 * @homepage https://practical-scheme.net/gauche/
 * @dependencies `curl.se/ca-certs>=2023`, `github.com/Mbed-TLS/mbedtls^3.5`, `github.com/besser82/libxcrypt^4.4`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.practicalschemenetgauche
 * console.log(pkg.name)        // "gauche"
 * console.log(pkg.description) // "R7RS Scheme implementation, developed to be a h..."
 * console.log(pkg.programs)    // ["gauche-cesconv", "gauche-config", ...]
 * console.log(pkg.versions[0]) // "0.9.15" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/practical-scheme-net/gauche.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const practicalschemenetgauchePackage = {
  /**
  * The display name of this package.
  */
  name: 'gauche' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'practical-scheme.net/gauche' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'R7RS Scheme implementation, developed to be a handy script interpreter' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/practical-scheme.net/gauche/package.yml' as const,
  homepageUrl: 'https://practical-scheme.net/gauche/' as const,
  githubUrl: 'https://github.com/shirok/Gauche' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install practical-scheme.net/gauche' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +practical-scheme.net/gauche -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install practical-scheme.net/gauche' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gauche-cesconv',
    'gauche-config',
    'gauche-install',
    'gauche-package',
    'gosh',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se/ca-certs>=2023',
    'github.com/Mbed-TLS/mbedtls^3.5',
    'github.com/besser82/libxcrypt^4.4',
    'zlib.net^1.3',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.15',
    '0.9.14',
  ] as const,
  aliases: [] as const,
}

export type PracticalschemenetgauchePackage = typeof practicalschemenetgauchePackage
