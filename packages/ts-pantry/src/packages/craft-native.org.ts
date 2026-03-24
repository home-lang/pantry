/**
 * **craft** - Build desktop apps with web languages, powered by Zig
 *
 * @domain `craft-native.org`
 * @programs `craft`
 * @version `0.0.5` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install craft-native.org`
 * @homepage https://craft-native.org
 * @buildDependencies `ziglang.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.craftnativeorg
 * console.log(pkg.name)        // "craft"
 * console.log(pkg.description) // "Build desktop apps with web languages, powered by Zig"
 * console.log(pkg.programs)    // ["craft"]
 * console.log(pkg.versions[0]) // "0.0.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/craft-native-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const craftPackage = {
  /**
  * The display name of this package.
  */
  name: 'craft' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'craft-native.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Build desktop apps with web languages, powered by Zig' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://craft-native.org' as const,
  githubUrl: 'https://github.com/home-lang/craft' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install craft-native.org' as const,
  pkgxInstallCommand: '' as const,
  pantryInstallCommand: 'pantry install craft-native.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'craft',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'ziglang.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.0.5',
    '0.0.4',
    '0.0.3',
    '0.0.2',
    '0.0.1',
  ] as const,
  aliases: ['craft'] as const,
}

export type CraftPackage = typeof craftPackage
