/**
 * **apptainer** - Application container and unprivileged sandbox platform for Linux
 *
 * @domain `apptainer.org`
 * @programs `apptainer`, `run-singularity`, `singularity`
 * @version `1.4.5` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install apptainer.org`
 * @homepage https://apptainer.org/
 * @dependencies `github.com/seccomp/libseccomp@2`, `curl.se/ca-certs`
 * @buildDependencies `go.dev@~1.21`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.apptainerorg
 * console.log(pkg.name)        // "apptainer"
 * console.log(pkg.description) // "Application container and unprivileged sandbox ..."
 * console.log(pkg.programs)    // ["apptainer", "run-singularity", ...]
 * console.log(pkg.versions[0]) // "1.4.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/apptainer-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const apptainerorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'apptainer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'apptainer.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Application container and unprivileged sandbox platform for Linux' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apptainer.org/package.yml' as const,
  homepageUrl: 'https://apptainer.org/' as const,
  githubUrl: 'https://github.com/apptainer/apptainer' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install apptainer.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apptainer.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install apptainer.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'apptainer',
    'run-singularity',
    'singularity',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'github.com/seccomp/libseccomp@2',
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'go.dev@~1.21',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.5',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0-rc.2',
    '1.4.0',
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.5',
    '1.2.4',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type ApptainerorgPackage = typeof apptainerorgPackage
