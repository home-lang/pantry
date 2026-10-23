/**
 * **dart** - The Dart SDK, including the VM, JS and Wasm compilers, analysis, core libraries, and more.
 *
 * @domain `dart.dev`
 * @programs `dart`, `dartaotruntime`
 * @version `3.13.7` (182 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install dart.dev`
 * @homepage https://dart.dev
 * @buildDependencies `curl.se`, `python.org@>=3<3.12`, `tukaani.org/xz` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.dartdev
 * console.log(pkg.name)        // "dart"
 * console.log(pkg.description) // "The Dart SDK, including the VM, JS and Wasm com..."
 * console.log(pkg.programs)    // ["dart", "dartaotruntime"]
 * console.log(pkg.versions[0]) // "3.13.7" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/dart-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const dartdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'dart' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dart.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Dart SDK, including the VM, JS and Wasm compilers, analysis, core libraries, and more.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dart.dev/package.yml' as const,
  homepageUrl: 'https://dart.dev' as const,
  githubUrl: 'https://github.com/dart-lang/sdk' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install dart.dev' as const,
  pantryInstallCommand: 'pantry install dart.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dart',
    'dartaotruntime',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
    'python.org@>=3<3.12',
    'tukaani.org/xz',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.13.7',
    '3.13.6',
    '3.13.5',
    '3.13.4',
    '3.13.3',
    '3.13.2',
    '3.13.1',
    '3.13.0',
    '3.12.2',
    '3.12.1',
    '3.12.0',
    '3.11.6',
    '3.11.5',
    '3.11.4',
    '3.11.3',
    '3.11.2',
    '3.11.1',
    '3.11.0',
    '3.10.9',
    '3.10.8',
    '3.10.7',
    '3.10.6',
    '3.10.5',
    '3.10.4',
    '3.10.3',
    '3.10.2',
    '3.10.1',
    '3.10.0',
    '3.9.4',
    '3.9.3',
    '3.9.2',
    '3.9.1',
    '3.9.0',
    '3.8.3',
    '3.8.2',
    '3.8.1',
    '3.8.0',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.4',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.4',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.4',
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.6',
    '3.2.5',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.5',
    '3.1.4',
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.7',
    '3.0.6',
    '3.0.5',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.19.6',
    '2.19.5',
    '2.19.4',
    '2.19.3',
    '2.19.2',
    '2.19.1',
    '2.19.0',
    '2.18.7',
    '2.18.6',
    '2.18.5',
    '2.18.4',
    '2.18.3',
    '2.18.2',
    '2.18.1',
    '2.18.0',
    '2.17.7',
    '2.17.6',
    '2.17.5',
    '2.17.3',
    '2.17.1',
    '2.17.0',
    '2.16.2',
    '2.16.1',
    '2.16.0',
    '2.15.1',
    '2.15.0',
    '2.14.4',
    '2.14.3',
    '2.14.2',
    '2.14.1',
    '2.14.0',
    '2.13.4',
    '2.13.3',
    '2.13.1',
    '2.13.0',
    '2.12.4',
    '2.12.3',
    '2.12.2',
    '2.12.1',
    '2.12.0',
    '2.10.5',
    '2.10.4',
    '2.10.3',
    '2.10.2',
    '2.10.1',
    '2.10.0',
    '2.9.3',
    '2.9.2',
    '2.9.1',
    '2.9.0',
    '2.8.4',
    '2.8.3',
    '2.8.2',
    '2.8.1',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.1',
    '2.6.0',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.1',
    '2.4.0',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.0',
    '1.24.3',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.0',
    '1.22.1',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.1',
    '1.19.1',
    '1.19.0',
    '1.18.1',
    '1.18.0',
    '1.17.1',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.0',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.3',
    '1.11.1',
    '1.11.0',
  ] as const,
  aliases: [] as const,
}

export type DartdevPackage = typeof dartdevPackage
