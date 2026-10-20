/**
 * **circleci** - Enables you to reproduce the CircleCI environment locally
 *
 * @domain `circleci.com`
 * @programs `circleci`
 * @version `1.8.0` (215 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install circleci.com`
 * @homepage https://circleci.com/docs/2.0/local-cli/
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.circlecicom
 * console.log(pkg.name)        // "circleci"
 * console.log(pkg.description) // "Enables you to reproduce the CircleCI environme..."
 * console.log(pkg.programs)    // ["circleci"]
 * console.log(pkg.versions[0]) // "1.8.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/circleci-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const circlecicomPackage = {
  /**
  * The display name of this package.
  */
  name: 'circleci' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'circleci.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Enables you to reproduce the CircleCI environment locally' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/circleci.com/package.yml' as const,
  homepageUrl: 'https://circleci.com/docs/2.0/local-cli/' as const,
  githubUrl: 'https://github.com/CircleCI-Public/circleci-cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install circleci.com' as const,
  pantryInstallCommand: 'pantry install circleci.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'circleci',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.52172',
    '1.0.52041',
    '1.0.52018',
    '1.0.51932',
    '1.0.51911',
    '1.0.51883',
    '1.0.51853',
    '1.0.51832',
    '1.0.51753',
    '1.0.51648',
    '1.0.51589',
    '1.0.51515',
    '1.0.51453',
    '1.0.51336',
    '1.0.51305',
    '1.0.51287',
    '1.0.51242',
    '1.0.50961',
    '1.0.50849',
    '1.0.50831',
    '1.0.50814',
    '1.0.50781',
    '1.0.50757',
    '1.0.50735',
    '1.0.50694',
    '1.0.50624',
    '1.0.50568',
    '1.0.50543',
    '1.0.50508',
    '1.0.50462',
    '1.0.50428',
    '1.0.50365',
    '1.0.50345',
    '1.0.50326',
    '1.0.50312',
    '1.0.50289',
    '1.0.50275',
    '1.0.50186',
    '1.0.50154',
    '1.0.50106',
    '1.0.50068',
    '1.0.50047',
    '1.0.50034',
    '1.0.50006',
    '1.0.49978',
    '1.0.49959',
    '1.0.49897',
    '1.0.49879',
    '1.0.49838',
    '1.0.49817',
    '1.0.49774',
    '1.0.49698',
    '1.0.49592',
    '1.0.49536',
    '1.0.49506',
    '1.0.49458',
    '1.0.49408',
    '1.0.49374',
    '1.0.49308',
    '1.0.49271',
    '1.0.49240',
    '1.0.49221',
    '1.0.49173',
    '1.0.49129',
    '1.0.49092',
    '1.0.49012',
    '1.0.48992',
    '1.0.48968',
    '1.0.48894',
    '1.0.48840',
    '1.0.48773',
    '1.0.48692',
    '1.0.48658',
    '1.0.48633',
    '1.0.48614',
    '1.0.48571',
    '1.0.48542',
    '1.0.48515',
    '1.0.48490',
    '1.0.48454',
    '1.0.48424',
    '1.0.48403',
    '1.0.48386',
    '1.0.48365',
    '1.0.48340',
    '1.0.48275',
    '1.0.48254',
    '1.0.48223',
    '1.0.48210',
    '1.0.48185',
    '1.0.48165',
    '1.0.48122',
    '1.0.48073',
    '1.0.48038',
    '1.0.47993',
    '1.0.47928',
    '1.0.47876',
    '1.0.47844',
    '1.0.47816',
    '1.0.47783',
    '1.0.47761',
    '1.0.47735',
    '1.0.47715',
    '1.0.47692',
    '1.0.47653',
    '1.0.47611',
    '1.0.47571',
    '1.0.47555',
    '1.0.47536',
    '1.0.47519',
    '1.0.47471',
    '1.0.47401',
    '1.0.47363',
    '1.0.47331',
    '1.0.47301',
    '1.0.47264',
    '1.0.47244',
    '1.0.47226',
    '1.0.47186',
    '1.0.47122',
    '1.0.47091',
    '1.0.47027',
    '1.0.46984',
    '1.0.46955',
    '0.1.47860',
    '0.1.47632',
    '0.1.38646',
    '0.1.36202',
    '0.1.36106',
    '0.1.35800',
    '0.1.35213',
    '0.1.34950',
    '0.1.34770',
    '0.1.34685',
    '0.1.34651',
    '0.1.34616',
    '0.1.34592',
    '0.1.34578',
    '0.1.34422',
    '0.1.34283',
    '0.1.34038',
    '0.1.33826',
    '0.1.33721',
    '0.1.33494',
    '0.1.33470',
    '0.1.33163',
    '0.1.33128',
    '0.1.32638',
    '0.1.32580',
    '0.1.32367',
    '0.1.32323',
    '0.1.32219',
    '0.1.32145',
    '0.1.32111',
    '0.1.32067',
    '0.1.31983',
    '0.1.31879',
    '0.1.31792',
    '0.1.31687',
    '0.1.31632',
    '0.1.31543',
    '0.1.31425',
    '0.1.31151',
    '0.1.30995',
    '0.1.30948',
    '0.1.30888',
    '0.1.30549',
    '0.1.30401',
    '0.1.30163',
    '0.1.30084',
    '0.1.29936',
    '0.1.29658',
    '0.1.29560',
    '0.1.29314',
    '0.1.29041',
    '0.1.28995',
    '0.1.28939',
    '0.1.28811',
    '0.1.28745',
    '0.1.28528',
    '0.1.28434',
    '0.1.28391',
    '0.1.28363',
    '0.1.28196',
    '0.1.28084',
    '0.1.27660',
    '0.1.27054',
    '0.1.26896',
    '0.1.26837',
    '0.1.26786',
    '0.1.26646',
    '0.1.26343',
    '0.1.26255',
    '0.1.26094',
    '0.1.26061',
    '0.1.25848',
    '0.1.25725',
    '0.1.25638',
    '0.1.25569',
    '0.1.25519',
    '0.1.25085',
    '0.1.25007',
    '0.1.24783',
    '0.1.24705',
    '0.1.24495',
    '0.1.24435',
    '0.1.23845',
  ] as const,
  aliases: [] as const,
}

export type CirclecicomPackage = typeof circlecicomPackage
