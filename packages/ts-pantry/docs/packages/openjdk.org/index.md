# openjdk

> Development kit for the Java programming language

## Package Information

- **Domain**: `openjdk.org`
- **Name**: `openjdk`
- **Homepage**: <https://openjdk.java.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openjdk.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install jdk
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

## Aliases

This package can also be accessed using these aliases:

- `java`
- `jdk`

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
# Install a specific version
pantry install openjdk.org@21.0.8.7
```

## Dependencies

The macOS JDK bundles its native libraries and uses Apple system frameworks.
The following runtime dependencies apply to Linux only:

- `linux:giflib.sourceforge.io`
- `linux:harfbuzz.org^8`
- `linux:libjpeg-turbo.org`
- `linux:libpng.org`
- `linux:littlecms.com`
- `linux:openprinting.github.io/cups`
- `linux:info-zip.org/unzip`
- `linux:zlib.net`
- `linux:libzip.org`
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
import { pantry } from 'ts-pantry'

// Access this package
const pkg = pantry.java

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openjdk.org/package.yml)
- [Homepage](https://openjdk.java.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
