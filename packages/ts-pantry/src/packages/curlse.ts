/**
 * **curl** - A command line tool and library for transferring data with URL syntax, supporting DICT, FILE, FTP, FTPS, GOPHER, GOPHERS, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, MQTT, POP3, POP3S, RTMP, RTMPS, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET, TFTP, WS and WSS. libcurl offers a myriad of powerful features
 *
 * @domain `curl.se`
 * @programs `curl`, `curl-config`
 * @version `8.23.0` (51 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install curl.se`
 * @aliases `curl`
 * @homepage https://curl.se
 * @dependencies `openssl.org^3`, `curl.se/ca-certs`, `zlib.net^1.2.11`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.curl
 * // Or access via domain
 * const samePkg = pantry.curlse
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "cURL"
 * console.log(pkg.description) // "A command line tool and library for transferrin..."
 * console.log(pkg.programs)    // ["curl", "curl-config"]
 * console.log(pkg.versions[0]) // "8.23.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/curl-se.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const curlPackage = {
  /**
  * The display name of this package.
  */
  name: 'cURL' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'curl.se' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A command line tool and library for transferring data with URL syntax, supporting DICT, FILE, FTP, FTPS, GOPHER, GOPHERS, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, MQTT, POP3, POP3S, RTMP, RTMPS, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET, TFTP, WS and WSS. libcurl offers a myriad of powerful features' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/curl.se/package.yml' as const,
  homepageUrl: 'https://curl.se' as const,
  githubUrl: 'https://github.com/curl/curl' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install curl.se' as const,
  pantryInstallCommand: 'pantry install curl.se' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'curl',
    'curl-config',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^3',
    'curl.se/ca-certs',
    'zlib.net^1.2.11',
    'nghttp2.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '8.23.0',
    '8.22.0',
    '8.21.0',
    '8.20.0',
    '8.19.0',
    '8.18.0',
    '8.17.0',
    '8.16.0',
    '8.15.0',
    '8.14.1',
    '8.14.0',
    '8.13.0',
    '8.12.1',
    '8.12.0',
    '8.11.1',
    '8.11.0',
    '8.10.1',
    '8.10.0',
    '8.9.1',
    '8.9.0',
    '8.8.0',
    '8.7.1',
    '8.7.0',
    '8.6.0',
    '8.5.0',
    '8.4.0',
    '8.3.0',
    '8.2.1',
    '8.2.0',
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.1',
    '8.0.0',
    '7.88.1',
    '7.88.0',
    '7.87.0',
    '7.86.0',
    '7.85.0',
    '7.84.0',
    '7.83.1',
    '7.83.0',
    '7.82.0',
    '7.81.0',
    '7.80.0',
    '7.79.1',
    '7.79.0',
    '7.78.0',
    '7.77.0',
    '7.76.1',
    '7.76.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'curl',
  ] as const,
}

export type CurlPackage = typeof curlPackage
