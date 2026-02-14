/**
 * **go-bindata** - A small utility which generates Go code from any file. Useful for embedding binary data in a Go program.
 *
 * @domain `github.com/kevinburke/go-bindata`
 * @programs `go-bindata`
 * @version `4.0.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kevinburke/go-bindata`
 * @buildDependencies `go.dev@^1.18`, `gnu.org/patch`, `crates.io/semverator@^0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkevinburkegobindata
 * console.log(pkg.name)        // "go-bindata"
 * console.log(pkg.description) // "A small utility which generates Go code from an..."
 * console.log(pkg.programs)    // ["go-bindata"]
 * console.log(pkg.versions[0]) // "4.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kevinburke/go-bindata.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gobindataPackage = {
  /**
  * The display name of this package.
  */
  name: 'go-bindata' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/kevinburke/go-bindata' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A small utility which generates Go code from any file. Useful for embedding binary data in a Go program.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kevinburke/go-bindata/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kevinburke/go-bindata' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/kevinburke/go-bindata' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kevinburke/go-bindata -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kevinburke/go-bindata' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'go-bindata',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
    'gnu.org/patch',
    'crates.io/semverator@^0',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.0.2',
    '3.25.0',
    '3.24.0',
  ] as const,
  aliases: [] as const,
}

export type GobindataPackage = typeof gobindataPackage
