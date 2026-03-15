/**
 * **pyyaml** - Canonical source repository for LibYAML
 *
 * @domain `pyyaml.org`
 * @version `0.2.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pyyaml.org`
 * @homepage http://pyyaml.org/wiki/LibYAML
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pyyamlorg
 * console.log(pkg.name)        // "pyyaml"
 * console.log(pkg.description) // "Canonical source repository for LibYAML"
 * console.log(pkg.versions[0]) // "0.2.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pyyaml-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pyyamlorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'pyyaml' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pyyaml.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Canonical source repository for LibYAML' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pyyaml.org/package.yml' as const,
  homepageUrl: 'http://pyyaml.org/wiki/LibYAML' as const,
  githubUrl: 'https://github.com/yaml/libyaml' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pyyaml.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pyyaml.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install pyyaml.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.5',
  ] as const,
  aliases: [] as const,
}

export type PyyamlorgPackage = typeof pyyamlorgPackage
