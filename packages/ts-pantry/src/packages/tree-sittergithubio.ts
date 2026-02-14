/**
 * **tree-sitter** - Parser generator tool and incremental parsing library
 *
 * @domain `tree-sitter.github.io`
 * @programs `tree-sitter`
 * @version `0.26.5` (37 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tree-sitter.github.io`
 * @homepage https://tree-sitter.github.io/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.treesittergithubio
 * console.log(pkg.name)        // "tree-sitter"
 * console.log(pkg.description) // "Parser generator tool and incremental parsing l..."
 * console.log(pkg.programs)    // ["tree-sitter"]
 * console.log(pkg.versions[0]) // "0.26.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tree-sitter-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const treesittergithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'tree-sitter' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tree-sitter.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Parser generator tool and incremental parsing library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tree-sitter.github.io/package.yml' as const,
  homepageUrl: 'https://tree-sitter.github.io/' as const,
  githubUrl: 'https://github.com/tree-sitter/tree-sitter' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tree-sitter.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tree-sitter.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tree-sitter.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tree-sitter',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.26.5',
    '0.26.4',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.25.10',
    '0.25.9',
    '0.25.8',
    '0.25.7',
    '0.25.6',
    '0.25.5',
    '0.25.4',
    '0.25.3',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.7',
    '0.24.6',
    '0.24.5',
    '0.24.4',
    '0.24.3',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.6',
    '0.22.5',
    '0.22.4',
    '0.22.3',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.0',
    '0.20.9',
    '0.20.8',
  ] as const,
  aliases: [] as const,
}

export type TreesittergithubioPackage = typeof treesittergithubioPackage
