/**
 * **synth** - The Declarative Data Generator
 *
 * @domain `getsynth.com`
 * @programs `synth`
 * @version `0.6.9` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install getsynth.com`
 * @homepage https://www.getsynth.com/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.getsynthcom
 * console.log(pkg.name)        // "synth"
 * console.log(pkg.description) // "The Declarative Data Generator"
 * console.log(pkg.programs)    // ["synth"]
 * console.log(pkg.versions[0]) // "0.6.9" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/getsynth-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const getsynthcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'synth' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'getsynth.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Declarative Data Generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/getsynth.com/package.yml' as const,
  homepageUrl: 'https://www.getsynth.com/' as const,
  githubUrl: 'https://github.com/shuttle-hq/synth' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install getsynth.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +getsynth.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install getsynth.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'synth',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.9',
    '0.6.8',
    '0.6.8-r2',
    '0.6.5-r1',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.1-r4',
    '0.6.0',
    '0.5.6',
    '0.5.5',
    '0.5.4',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0-r4',
    '0.5.0-r1',
    '0.4.7',
    '0.4.6-r4',
    '0.4.6-r3',
    '0.4.6-r2',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.3.0-r2',
  ] as const,
  aliases: [] as const,
}

export type GetsynthcomPackage = typeof getsynthcomPackage
