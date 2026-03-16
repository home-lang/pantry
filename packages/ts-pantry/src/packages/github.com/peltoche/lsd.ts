/**
 * **lsd** - Clone of ls with colorful output, file type icons, and more
 *
 * @domain `github.com/peltoche/lsd`
 * @programs `lsd`
 * @version `1.2.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/peltoche/lsd`
 * @dependencies `libgit2.org~1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcompeltochelsd
 * console.log(pkg.name)        // "lsd"
 * console.log(pkg.description) // "Clone of ls with colorful output, file type ico..."
 * console.log(pkg.programs)    // ["lsd"]
 * console.log(pkg.versions[0]) // "1.2.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/peltoche/lsd.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const lsdPackage = {
  /**
  * The display name of this package.
  */
  name: 'lsd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/peltoche/lsd' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Clone of ls with colorful output, file type icons, and more' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peltoche/lsd/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/lsd-rs/lsd' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/peltoche/lsd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/peltoche/lsd -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/peltoche/lsd' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'lsd',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libgit2.org~1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.0',
    '1.1.5',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.0',
    '0.23.1',
  ] as const,
  aliases: [] as const,
}

export type LsdPackage = typeof lsdPackage
