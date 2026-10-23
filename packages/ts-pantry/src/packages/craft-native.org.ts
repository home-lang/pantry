/**
 * **craft** - Build desktop apps with web languages, powered by Zig
 *
 * @domain `craft-native.org`
 * @programs `craft`
 * @version `0.0.301` (163 versions available)
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
 * console.log(pkg.versions[0]) // "0.0.301" (latest)
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
  githubUrl: 'https://github.com/craft-native/craft' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install craft-native.org' as const,
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
    '0.0.301',
    '0.0.299',
    '0.0.296',
    '0.0.293',
    '0.0.290',
    '0.0.278',
    '0.0.276',
    '0.0.272',
    '0.0.262',
    '0.0.254',
    '0.0.251',
    '0.0.250',
    '0.0.249',
    '0.0.248',
    '0.0.247',
    '0.0.246',
    '0.0.245',
    '0.0.244',
    '0.0.243',
    '0.0.242',
    '0.0.241',
    '0.0.238',
    '0.0.237',
    '0.0.236',
    '0.0.235',
    '0.0.234',
    '0.0.233',
    '0.0.232',
    '0.0.231',
    '0.0.228',
    '0.0.227',
    '0.0.226',
    '0.0.225',
    '0.0.224',
    '0.0.223',
    '0.0.222',
    '0.0.221',
    '0.0.220',
    '0.0.219',
    '0.0.218',
    '0.0.217',
    '0.0.216',
    '0.0.215',
    '0.0.214',
    '0.0.213',
    '0.0.212',
    '0.0.211',
    '0.0.210',
    '0.0.209',
    '0.0.207',
    '0.0.206',
    '0.0.205',
    '0.0.204',
    '0.0.203',
    '0.0.202',
    '0.0.201',
    '0.0.200',
    '0.0.199',
    '0.0.198',
    '0.0.197',
    '0.0.196',
    '0.0.195',
    '0.0.194',
    '0.0.193',
    '0.0.192',
    '0.0.191',
    '0.0.189',
    '0.0.187',
    '0.0.186',
    '0.0.185',
    '0.0.184',
    '0.0.183',
    '0.0.182',
    '0.0.181',
    '0.0.180',
    '0.0.179',
    '0.0.178',
    '0.0.177',
    '0.0.176',
    '0.0.175',
    '0.0.174',
    '0.0.173',
    '0.0.172',
    '0.0.171',
    '0.0.170',
    '0.0.169',
    '0.0.168',
    '0.0.167',
    '0.0.166',
    '0.0.164',
    '0.0.163',
    '0.0.162',
    '0.0.161',
    '0.0.160',
    '0.0.158',
    '0.0.157',
    '0.0.156',
    '0.0.155',
    '0.0.154',
    '0.0.153',
    '0.0.152',
    '0.0.151',
    '0.0.150',
    '0.0.149',
    '0.0.148',
    '0.0.147',
    '0.0.146',
    '0.0.145',
    '0.0.144',
    '0.0.143',
    '0.0.142',
    '0.0.141',
    '0.0.140',
    '0.0.139',
    '0.0.138',
    '0.0.136',
    '0.0.135',
    '0.0.134',
    '0.0.133',
    '0.0.132',
    '0.0.128',
    '0.0.127',
    '0.0.126',
    '0.0.125',
    '0.0.124',
    '0.0.123',
    '0.0.122',
    '0.0.121',
    '0.0.120',
    '0.0.119',
    '0.0.118',
    '0.0.115',
    '0.0.113',
    '0.0.112',
    '0.0.111',
    '0.0.110',
    '0.0.109',
    '0.0.107',
    '0.0.105',
    '0.0.104',
    '0.0.103',
    '0.0.101',
    '0.0.100',
    '0.0.99',
    '0.0.98',
    '0.0.97',
    '0.0.96',
    '0.0.92',
    '0.0.91',
    '0.0.90',
    '0.0.88',
    '0.0.87',
    '0.0.86',
    '0.0.85',
    '0.0.84',
    '0.0.83',
    '0.0.81',
    '0.0.80',
    '0.0.79',
    '0.0.37',
    '0.0.23',
    '0.0.20',
    '0.0.19',
  ] as const,
  aliases: ['craft'] as const,
}

export type CraftPackage = typeof craftPackage
