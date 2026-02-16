# nss

> Libraries for security-enabled client and server applications

## Package Information

- **Domain**: `mozilla.org/nss`
- **Name**: `nss`
- **Homepage**: <https://firefox-source-docs.mozilla.org/security/nss/index.html>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/nss/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mozilla.org/nss
```

## Programs

This package provides the following executable programs:

- `addbuiltin`
- `certutil`
- `crmftest`
- `ecperf`
- `listsuites`
- `multinit`
- `ocspresp`
- `p7verify`
- `pk12util`
- `remtest`
- `secmodtest`
- `ssltap`
- `vfychain`
- `atob`
- `chktest`
- `dbtest`
- `encodeinttest`
- `nonspr10`
- `oidcalc`
- `pk11ectest`
- `pk1sign`
- `rsaperf`
- `selfserv`
- `strsclnt`
- `vfyserv`
- `baddbdir`
- `cmsutil`
- `derdump`
- `fbectest`
- `makepqg`
- `nss-config`
- `p7content`
- `pk11gcmtest`
- `pkix-errcodes`
- `rsapoptst`
- `shlibsign`
- `symkeyutil`
- `bltest`
- `conflict`
- `dertimetest`
- `fipstest`
- `mangle`
- `nss-policy-check`
- `p7env`
- `pk11importtest`
- `pp`
- `sdbthreadtst`
- `signtool`
- `tstclnt`
- `btoa`
- `crlutil`
- `digest`
- `httpserv`
- `modutil`
- `ocspclnt`
- `p7sign`
- `pk11mode`
- `pwdecrypt`
- `sdrtest`
- `signver`
- `validation`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.92.0`

</details>

**Latest Version**: `3.92.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mozilla.org/nss@3.92.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `mozilla.org/nspr`
- `sqlite.org`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nss

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/nss/package.yml)
- [Homepage](https://firefox-source-docs.mozilla.org/security/nss/index.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
