# openjdk

> Development kit for the Java programming language

## Package Information

- **Domain**: `openjdk.org`
- **Name**: `openjdk`
- **Homepage**: <https://openjdk.java.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openjdk.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openjdk.org
```

## Programs

This package provides the following executable programs:

- `jar`
- `jarsigner`
- `java`
- `javac`
- `javadoc`
- `javap`
- `jcmd`
- `jconsole`
- `jdb`
- `jdeprscan`
- `jdeps`
- `jfr`
- `jhsdb`
- `jimage`
- `jinfo`
- `jlink`
- `jmap`
- `jmod`
- `jps`
- `jrunscript`
- `jshell`
- `jstack`
- `jstat`
- `jstatd`
- `keytool`
- `rmiregistry`
- `serialver`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `21.0.8.7`, `21.0.7.4`, `21.0.6.6`, `21.0.3.6`
- `17.0.16.7`, `17.0.11.4`, `17.0.10.6`
- `11.0.28.5`, `11.0.23.6`

</details>

**Latest Version**: `21.0.8.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openjdk.org@21.0.8.7 -- $SHELL -i
```

## Dependencies

This package depends on:

- `giflib.sourceforge.io`
- `harfbuzz.org^8`
- `libjpeg-turbo.org`
- `libpng.org`
- `littlecms.com`
- `openprinting.github.io/cups`
- `info-zip.org/unzip`
- `zlib.net`
- `libzip.org`
- `linux:alsa-project.org/alsa-lib`
- `linux:freedesktop.org/fontconfig`
- `linux:freetype.org`
- `linux:x.org/x11`
- `linux:x.org/exts`
- `linux:x.org/xrandr`
- `linux:x.org/xrender`
- `linux:x.org/xt`
- `linux:x.org/xtst`
- `linux:info-zip.org/zip`
- `linux:darwinsys.com/file`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.openjdk

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openjdk.org/package.yml)
- [Homepage](https://openjdk.java.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
