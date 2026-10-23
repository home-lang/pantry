/**
 * **zig** - General-purpose programming language and toolchain for maintaining robust, optimal, and reusable software.
 *
 * @domain `ziglang.org`
 * @programs `zig`
 * @version `0.18.0-dev.470+6817928c3` (130 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ziglang.org`
 * @homepage https://ziglang.org/
 * @buildDependencies `curl.se`, `gnu.org/tar`, `tukaani.org/xz` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.ziglangorg
 * console.log(pkg.name)        // "zig"
 * console.log(pkg.description) // "General-purpose programming language and toolch..."
 * console.log(pkg.programs)    // ["zig"]
 * console.log(pkg.versions[0]) // "0.18.0-dev.470+6817928c3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ziglang-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const ziglangorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'zig' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ziglang.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'General-purpose programming language and toolchain for maintaining robust, optimal, and reusable software.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ziglang.org/package.yml' as const,
  homepageUrl: 'https://ziglang.org/' as const,
  githubUrl: 'https://github.com/ziglang/zig' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ziglang.org' as const,
  pantryInstallCommand: 'pantry install ziglang.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'zig',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
    'gnu.org/tar',
    'tukaani.org/xz',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.18.0-dev.470+6817928c3',
    '0.18.0-dev.367+187d0bf9e',
    '0.18.0-dev.362+705a6b4ef',
    '0.18.0-dev.349+d924f83bf',
    '0.18.0-dev.253+16d31ceed',
    '0.18.0-dev.252+86dc5ce25',
    '0.18.0-dev.246+05671ced9',
    '0.18.0-dev.146+35accc06e',
    '0.18.0-dev.131+41f885830',
    '0.18.0-dev.120+9fe22a29b',
    '0.18.0-dev.35+5e754304d',
    '0.18.0-dev.4+5a23bf4b2',
    '0.18.0-dev.2+faa537cf9',
    '0.18.0-dev.1+a6c6412a8',
    '0.17.0',
    '0.17.0-dev.2384+ac77c23af',
    '0.17.0-dev.2375+d8aab4878',
    '0.17.0-dev.2338+b46a7f3a2',
    '0.17.0-dev.2329+1b7a78122',
    '0.17.0-dev.2320+1e770dbef',
    '0.17.0-dev.2313+5b9147ed5',
    '0.17.0-dev.2307+392b17125',
    '0.17.0-dev.2294+71403f299',
    '0.17.0-dev.2281+83624acf6',
    '0.17.0-dev.2267+48abf1a34',
    '0.17.0-dev.2264+230c63650',
    '0.17.0-dev.2251+1175a3e99',
    '0.17.0-dev.2248+3f6a02acd',
    '0.17.0-dev.2234+80fe9b2b7',
    '0.17.0-dev.2228+955228b68',
    '0.17.0-dev.2163+89ff10d56',
    '0.17.0-dev.2151+2ec5523d5',
    '0.17.0-dev.2131+d08989840',
    '0.17.0-dev.2127+e90365cd5',
    '0.17.0-dev.2125+0d600e488',
    '0.17.0-dev.2122+3e15e99e6',
    '0.17.0-dev.2085+5e36170b5',
    '0.17.0-dev.2056+79a9897cd',
    '0.17.0-dev.2033+af24fd11a',
    '0.17.0-dev.2018+ab30a0b9a',
    '0.17.0-dev.2015+3fdcbc03d',
    '0.17.0-dev.1963+e00c6c439',
    '0.17.0-dev.1946+d813faaf0',
    '0.17.0-dev.1941+71115f0ab',
    '0.17.0-dev.1936+5a625d5f3',
    '0.17.0-dev.1933+e19a73c2d',
    '0.17.0-dev.1902+896bd9e15',
    '0.17.0-dev.1893+78e3b1c73',
    '0.17.0-dev.1884+841dd0eb8',
    '0.17.0-dev.1862+40ebd8162',
    '0.17.0-dev.1859+dcceb318e',
    '0.17.0-dev.1857+3c46da14d',
    '0.17.0-dev.1824+7988f7952',
    '0.17.0-dev.1818+7051f8e73',
    '0.17.0-dev.1811+6716bf52e',
    '0.17.0-dev.1786+75044cb04',
    '0.17.0-dev.1778+767d25269',
    '0.17.0-dev.1770+5d7cf3f34',
    '0.17.0-dev.1767+63cfe88f0',
    '0.17.0-dev.1756+613c03321',
    '0.17.0-dev.1745+ac8a8d0c5',
    '0.17.0-dev.1737+de207594e',
    '0.17.0-dev.1683+5ceec001b',
    '0.17.0-dev.1676+c9dc9b798',
    '0.17.0-dev.1662+cc6f42302',
    '0.17.0-dev.1640+2597da025',
    '0.17.0-dev.1622+2b242157b',
    '0.17.0-dev.1609+11e2bb391',
    '0.17.0-dev.1606+a06534d73',
    '0.17.0-dev.1567+f0354179a',
    '0.17.0-dev.1564+97ced1272',
    '0.17.0-dev.1552+79dc16a0e',
    '0.17.0-dev.1543+6db520a4c',
    '0.17.0-dev.1525+91c6d8a09',
    '0.17.0-dev.1516+8a4b5424d',
    '0.17.0-dev.1509+bb296ab9b',
    '0.17.0-dev.1503+1f1bee62e',
    '0.17.0-dev.1476+91a29d707',
    '0.17.0-dev.1471+ff10b90bc',
    '0.17.0-dev.1465+8b2d0ce21',
    '0.17.0-dev.1464+6aff551f1',
    '0.17.0-dev.1456+2b1c6633a',
    '0.17.0-dev.1454+5faa79730',
    '0.17.0-dev.1442+972627084',
    '0.17.0-dev.1441+d5181a9c9',
    '0.17.0-dev.1426+58a94eaae',
    '0.17.0-dev.1422+e863bf3be',
    '0.17.0-dev.1417+20befa4e6',
    '0.17.0-dev.1415+64dfaa568',
    '0.17.0-dev.1413+addc3c3b8',
    '0.17.0-dev.1398+cb5635714',
    '0.17.0-dev.1397+4331ba0fb',
    '0.17.0-dev.1387+01b60634c',
    '0.17.0-dev.1282+c0f9b51d8',
    '0.17.0-dev.1275+59a628c6d',
    '0.17.0-dev.1267+300116b02',
    '0.17.0-dev.1257+67b05e521',
    '0.17.0-dev.1252+e4b325c19',
    '0.17.0-dev.1245+efd6f190f',
    '0.17.0-dev.1158+1d1193aa7',
    '0.17.0-dev.1099+7db2ef610',
    '0.17.0-dev.986+f3544a707',
    '0.17.0-dev.978+a078d55a2',
    '0.17.0-dev.956+2dca73595',
    '0.17.0-dev.131+73c51c142',
    '0.16.0',
    '0.16.0-dev.3153+d6f43caad',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.1',
    '0.14.0',
    '0.13.0',
    '0.12.1',
    '0.12.0',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.1',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.0',
    '0.5.0',
    '0.4.0',
    '0.3.0',
    '0.2.0',
    '0.1.1',
  ] as const,
  aliases: [] as const,
}

export type ZiglangorgPackage = typeof ziglangorgPackage
