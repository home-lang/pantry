# cURL

> A command line tool and library for transferring data with URL syntax, supporting DICT, FILE, FTP, FTPS, GOPHER, GOPHERS, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, MQTT, POP3, POP3S, RTMP, RTMPS, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET, TFTP, WS and WSS. libcurl offers a myriad of powerful features

## Package Information

- **Domain**: `curl.se`
- **Name**: `cURL`
- **Homepage**: <https://curl.se>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/curl.se/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install curl
```

## Programs

This package provides the following executable programs:

- `curl`
- `curl-config`

## Aliases

This package can also be accessed using these aliases:

- `curl`

## Available Versions

<details>
<summary>Show all 28 versions</summary>

- `8.17.0`, `8.16.0`, `8.15.0`, `8.14.1`, `8.14.0`
- `8.13.0`, `8.12.1`, `8.12.0`, `8.11.1`, `8.11.0`
- `8.10.1`, `8.10.0`, `8.9.1`, `8.9.0`, `8.8.0`
- `8.7.1`, `8.6.0`, `8.5.0`, `8.4.0`, `8.3.0`
- `8.2.1`, `8.2.0`, `8.1.2`, `8.1.0`, `8.0.1`
- `8.0.0`, `7.86.0`, `7.85.0`

</details>

**Latest Version**: `8.17.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +curl.se@8.17.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `curl.se/ca-certs`
- `zlib.net^1.2.11`
- `nghttp2.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.curl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/curl.se/package.yml)
- [Homepage](https://curl.se)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
