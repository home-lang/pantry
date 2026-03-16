/**
 * **cicada** - An old-school bash-like Unix shell written in Rust
 *
 * @domain `hugo.wang/cicada`
 * @programs `cicada`
 * @version `1.2.2` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install hugo.wang/cicada`
 * @homepage https://hugo.wang/cicada/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.hugowangcicada
 * console.log(pkg.name)        // "cicada"
 * console.log(pkg.description) // "An old-school bash-like Unix shell written in Rust"
 * console.log(pkg.programs)    // ["cicada"]
 * console.log(pkg.versions[0]) // "1.2.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/hugo-wang/cicada.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const hugowangcicadaPackage = {
  /**
  * The display name of this package.
  */
  name: 'cicada' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'hugo.wang/cicada' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'An old-school bash-like Unix shell written in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hugo.wang/cicada/package.yml' as const,
  homepageUrl: 'https://hugo.wang/cicada/' as const,
  githubUrl: 'https://github.com/mitnk/cicada' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install hugo.wang/cicada' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hugo.wang/cicada -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install hugo.wang/cicada' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cicada',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.9.41',
    '0.9.40',
    '0.9.39',
    '0.9.38',
  ] as const,
  aliases: [] as const,
}

export type HugowangcicadaPackage = typeof hugowangcicadaPackage
