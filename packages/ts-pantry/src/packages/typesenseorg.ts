/**
 * **typesense** - Fast, typo-tolerant search engine
 *
 * @domain `typesense.org`
 * @programs `typesense-server`
 *
 * @install `pantry install typesense.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.typesenseorg
 * console.log(pkg.name)        // "typesense"
 * console.log(pkg.programs)    // ["typesense-server"]
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/typesense-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const typesenseorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'typesense' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'typesense.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Fast, typo-tolerant search engine for building delightful search experiences' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://typesense.org' as const,
  githubUrl: 'https://github.com/typesense/typesense' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install typesense.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +typesense.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install typesense.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'typesense-server',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
    '30.2',
    '30.1',
    '30.0',
    '29.1',
    '29.0',
    '28.0',
    '27.1',
    '27.0',
    '26.0',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.1',
    '0.24.0',
    '0.23.1',
    '0.23.0',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.0',
    '0.18.0',
    '0.17.0',
    '0.16.1',
    '0.16.0',
    '0.15.0',
    '0.14.0',
    '0.13.0',
    '0.12.0',
    '0.11.2',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type TypesenseorgPackage = typeof typesenseorgPackage
