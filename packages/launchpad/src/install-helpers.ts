/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'

/**
 * Create version symlinks like pkgx: v1 -> v1.3.1, v* -> v1.3.1
 */
export async function createVersionSymlinks(installPath: string, domain: string, version: string): Promise<void> {
  const domainDir = path.join(installPath, domain)
  const versionDir = `v${version}`

  // Parse semantic version for creating major/minor symlinks
  const versionParts = version.split('.')
  const major = versionParts[0]
  const minor = `${major}.${versionParts[1] || '0'}`

  const symlinks = [
    { link: 'v*', target: versionDir },
    { link: `v${major}`, target: versionDir },
  ]

  // Add minor version symlink if it's different from major
  if (minor !== major) {
    symlinks.push({ link: `v${minor}`, target: versionDir })
  }

  for (const { link, target } of symlinks) {
    const linkPath = path.join(domainDir, link)

    try {
      // Remove existing symlink if it exists
      if (fs.existsSync(linkPath)) {
        await fs.promises.unlink(linkPath)
      }

      await fs.promises.symlink(target, linkPath)

      if (config.verbose) {
        console.warn(`Created symlink: ${link} -> ${target}`)
      }
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`Failed to create symlink ${link} -> ${target}:`, error)
      }
    }
  }
}

/**
 * Create shims in bin directory that point to the actual binaries
 */
export async function createShims(packageDir: string, installPath: string, domain: string, version: string): Promise<string[]> {
  const shimDir = path.join(installPath, 'bin')
  await fs.promises.mkdir(shimDir, { recursive: true })

  // Also create sbin directory for system binaries
  const sbinShimDir = path.join(installPath, 'sbin')
  await fs.promises.mkdir(sbinShimDir, { recursive: true })

  const installedBinaries: string[] = []

  // Check both bin and sbin directories for binaries
  const binaryDirs = [
    { sourceDir: path.join(packageDir, 'bin'), shimDir },
    { sourceDir: path.join(packageDir, 'sbin'), shimDir: sbinShimDir },
  ]

  // Helper function to build library paths for this package and its dependencies
  function buildLibraryPaths(packageDir: string, installPath: string): string[] {
    const libraryPaths: string[] = []

    // Add library paths from this package
    const packageLibDirs = [
      path.join(packageDir, 'lib'),
      path.join(packageDir, 'lib64'),
    ]

    for (const libDir of packageLibDirs) {
      if (fs.existsSync(libDir)) {
        libraryPaths.push(libDir)
      }
    }

    // Add library paths from all installed packages in the environment
    try {
      const domains = fs.readdirSync(installPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory()
          && !['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache'].includes(dirent.name))

      for (const domainEntry of domains) {
        const domainPath = path.join(installPath, domainEntry.name)
        if (fs.existsSync(domainPath)) {
          const versions = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

          for (const versionEntry of versions) {
            const versionPath = path.join(domainPath, versionEntry.name)
            const depLibDirs = [
              path.join(versionPath, 'lib'),
              path.join(versionPath, 'lib64'),
            ]

            for (const libDir of depLibDirs) {
              if (fs.existsSync(libDir) && !libraryPaths.includes(libDir)) {
                libraryPaths.push(libDir)
              }
            }
          }
        }
      }
    }
    catch {
      // Ignore errors reading directories
    }

    return libraryPaths
  }

  // Helper function to build pkg-config paths for all installed packages
  function buildPkgConfigPaths(installPath: string): string[] {
    const pkgConfigPaths: string[] = []

    try {
      const domains = fs.readdirSync(installPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory()
          && !['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache'].includes(dirent.name))

      for (const domainEntry of domains) {
        const domainPath = path.join(installPath, domainEntry.name)
        if (fs.existsSync(domainPath)) {
          const versions = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

          for (const versionEntry of versions) {
            const versionPath = path.join(domainPath, versionEntry.name)
            const pkgConfigDirs = [
              path.join(versionPath, 'lib', 'pkgconfig'),
              path.join(versionPath, 'lib64', 'pkgconfig'),
            ]

            for (const pkgConfigDir of pkgConfigDirs) {
              if (fs.existsSync(pkgConfigDir) && !pkgConfigPaths.includes(pkgConfigDir)) {
                pkgConfigPaths.push(pkgConfigDir)
              }
            }
          }
        }
      }
    }
    catch {
      // Ignore errors reading directories
    }

    return pkgConfigPaths
  }

  // Helper function to build include paths for all installed packages
  function buildIncludePaths(installPath: string): string[] {
    const includePaths: string[] = []

    try {
      const domains = fs.readdirSync(installPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory()
          && !['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache'].includes(dirent.name))

      for (const domainEntry of domains) {
        const domainPath = path.join(installPath, domainEntry.name)
        if (fs.existsSync(domainPath)) {
          const versions = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

          for (const versionEntry of versions) {
            const versionPath = path.join(domainPath, versionEntry.name)
            const includeDir = path.join(versionPath, 'include')

            if (fs.existsSync(includeDir) && !includePaths.includes(includeDir)) {
              includePaths.push(includeDir)
            }
          }
        }
      }
    }
    catch {
      // Ignore errors reading directories
    }

    return includePaths
  }

  const libraryPaths = buildLibraryPaths(packageDir, installPath)
  const pkgConfigPaths = buildPkgConfigPaths(installPath)
  const includePaths = buildIncludePaths(installPath)

  for (const { sourceDir, shimDir: targetShimDir } of binaryDirs) {
    if (!fs.existsSync(sourceDir)) {
      continue
    }

    const binaries = await fs.promises.readdir(sourceDir)

    for (const binary of binaries) {
      const binaryPath = path.join(sourceDir, binary)
      const stat = await fs.promises.stat(binaryPath)

      // Check if it's an executable file
      if (stat.isFile() && (stat.mode & 0o111)) {
        const shimPath = path.join(targetShimDir, binary)

        // Create a shell script shim that sets up the environment and library paths
        let shimContent = `#!/bin/sh
# Launchpad shim for ${binary} (${domain} v${version})

# Set up comprehensive build environment for launchpad-installed packages
`

        // Set up library paths for dynamic linking
        if (libraryPaths.length > 0) {
          const libraryPathString = libraryPaths.join(':')
          shimContent += `# macOS dynamic library paths
if [ -n "$DYLD_LIBRARY_PATH" ]; then
  export DYLD_LIBRARY_PATH="${libraryPathString}:$DYLD_LIBRARY_PATH"
else
  export DYLD_LIBRARY_PATH="${libraryPathString}"
fi

if [ -n "$DYLD_FALLBACK_LIBRARY_PATH" ]; then
  export DYLD_FALLBACK_LIBRARY_PATH="${libraryPathString}:$DYLD_FALLBACK_LIBRARY_PATH"
else
  export DYLD_FALLBACK_LIBRARY_PATH="${libraryPathString}:/usr/local/lib:/lib:/usr/lib"
fi

# Linux dynamic library paths
if [ -n "$LD_LIBRARY_PATH" ]; then
  export LD_LIBRARY_PATH="${libraryPathString}:$LD_LIBRARY_PATH"
else
  export LD_LIBRARY_PATH="${libraryPathString}"
fi

`
        }

        // Set up pkg-config paths for build tools
        if (pkgConfigPaths.length > 0) {
          const pkgConfigPathString = pkgConfigPaths.join(':')
          shimContent += `# Set up pkg-config to find launchpad-installed libraries
if [ -n "$PKG_CONFIG_PATH" ]; then
  export PKG_CONFIG_PATH="${pkgConfigPathString}:$PKG_CONFIG_PATH"
else
  export PKG_CONFIG_PATH="${pkgConfigPathString}"
fi

`
        }

        // Set up include paths for compilation
        if (includePaths.length > 0) {
          const includePathString = includePaths.join(' ')
          shimContent += `# Set up include paths for compilation
if [ -n "$CPPFLAGS" ]; then
  export CPPFLAGS="-I${includePathString} $CPPFLAGS"
else
  export CPPFLAGS="-I${includePathString}"
fi

# Set up library paths for linking
if [ -n "$LDFLAGS" ]; then
  export LDFLAGS="-L${libraryPaths.join(' -L')} $LDFLAGS"
else
  export LDFLAGS="-L${libraryPaths.join(' -L')}"
fi

`
        }

        shimContent += `# Execute the actual binary
exec "${binaryPath}" "$@"
`

        await fs.promises.writeFile(shimPath, shimContent)
        await fs.promises.chmod(shimPath, 0o755)

        installedBinaries.push(binary)

        if (config.verbose) {
          console.warn(`Created shim: ${binary} -> ${binaryPath}`)
          // Don't spam library paths for every binary - they're mostly the same
        }
      }
    }
  }

  return installedBinaries
}

/**
 * Create version compatibility symlinks for packages that expect different version paths
 * This handles cases where a package built for openssl.org/v1 needs to work with openssl.org/v3
 */
export async function createVersionCompatibilitySymlinks(installPath: string, domain: string, version: string): Promise<void> {
  const packageDir = path.join(installPath, domain)
  const versionDir = path.join(packageDir, `v${version}`)

  if (!fs.existsSync(versionDir)) {
    return
  }

  // Define compatibility mappings for common version mismatches
  const versionCompatibility: Record<string, string[]> = {
    'openssl.org': ['v1', 'v1.1', 'v1.0'], // OpenSSL v3 should be compatible with v1.x expectations
    'libssl': ['v1', 'v1.1'],
    'libcrypto': ['v1', 'v1.1'],
  }

  const compatVersions = versionCompatibility[domain] || []

  for (const compatVersion of compatVersions) {
    const compatDir = path.join(packageDir, compatVersion)

    // Only create symlink if the compat version doesn't already exist
    if (!fs.existsSync(compatDir)) {
      try {
        // Create symlink from compat version to actual version
        await fs.promises.symlink(`v${version}`, compatDir)
        if (config.verbose) {
          console.warn(`Created compatibility symlink: ${compatVersion} -> v${version} for ${domain}`)
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Failed to create compatibility symlink for ${domain}: ${error}`)
        }
      }
    }
  }
}

/**
 * Create common library symlinks for better compatibility
 * Many packages expect generic library names but we install versioned ones
 */
export async function createLibrarySymlinks(packageDir: string, domain: string): Promise<void> {
  const libDir = path.join(packageDir, 'lib')
  if (!fs.existsSync(libDir))
    return

  const commonSymlinks: Record<string, Array<{ target: string, link: string }>> = {
    'libpng.org': [
      { target: 'libpng16.dylib', link: 'libpng.dylib' },
      { target: 'libpng16.so', link: 'libpng.so' },
    ],
    'invisible-island.net/ncurses': [
      { target: 'libncurses.6.dylib', link: 'libncurses.dylib' },
      { target: 'libncurses.so.6', link: 'libncurses.so' },
    ],
    'gnu.org/readline': [
      { target: 'libreadline.8.dylib', link: 'libreadline.dylib' },
      { target: 'libreadline.so.8', link: 'libreadline.so' },
    ],
    'openssl.org': [
      { target: 'libssl.3.dylib', link: 'libssl.dylib' },
      { target: 'libcrypto.3.dylib', link: 'libcrypto.dylib' },
      { target: 'libssl.so.3', link: 'libssl.so' },
      { target: 'libcrypto.so.3', link: 'libcrypto.so' },
    ],
  }

  const symlinkConfig = commonSymlinks[domain]
  if (!symlinkConfig)
    return

  for (const { target, link } of symlinkConfig) {
    const targetPath = path.join(libDir, target)
    const linkPath = path.join(libDir, link)

    if (fs.existsSync(targetPath) && !fs.existsSync(linkPath)) {
      try {
        fs.symlinkSync(target, linkPath)
        if (config.verbose) {
          console.log(`Created symlink: ${link} -> ${target}`)
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Failed to create symlink ${link}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }
  }
}

/**
 * Validate if a package installation is complete
 * A package is considered incomplete if it's a library package but only has bin/ and no lib/
 */
export async function validatePackageInstallation(packageDir: string, domain: string): Promise<boolean> {
  try {
    const binDir = path.join(packageDir, 'bin')
    const sbinDir = path.join(packageDir, 'sbin')
    const libDir = path.join(packageDir, 'lib')
    const lib64Dir = path.join(packageDir, 'lib64')

    const hasBin = fs.existsSync(binDir)
    const hasSbin = fs.existsSync(sbinDir)
    const hasLib = fs.existsSync(libDir)
    const hasLib64 = fs.existsSync(lib64Dir)

    // If no bin or sbin directory exists, check if it's purely a library package
    if (!hasBin && !hasSbin) {
      // For pure library packages, having lib/ is enough
      if (hasLib || hasLib64) {
        return true
      }
      return false
    }

    // Special handling for packages that are known to work differently
    const specialCases: Record<string, () => boolean> = {
      'sqlite.org': () => {
        // SQLite can work with just binaries, lib/ is optional
        return hasBin && fs.existsSync(path.join(binDir, 'sqlite3'))
      },
      'php.net': () => {
        // PHP can work with just binaries, especially if source-built
        return hasBin && fs.existsSync(path.join(binDir, 'php'))
      },
      'gnu.org/bison': () => {
        // Bison is a tool, only needs bin/
        return hasBin
      },
      'gnu.org/m4': () => {
        // M4 is a tool, only needs bin/
        return hasBin
      },
      're2c.org': () => {
        // re2c is a tool, only needs bin/
        return hasBin
      },
      'gnu.org/sed': () => {
        // sed is a tool, only needs bin/
        return hasBin
      },
      'gnu.org/autoconf': () => {
        // autoconf is a tool, only needs bin/
        return hasBin
      },
      'gnu.org/automake': () => {
        // automake is a tool, only needs bin/
        return hasBin
      },
      'freedesktop.org/pkg-config': () => {
        // pkg-config is a tool, only needs bin/
        return hasBin
      },
      'x.org/util-macros': () => {
        // X11 util-macros provides build macros in share/aclocal or share/pkgconfig
        const shareDir = path.join(packageDir, 'share')
        const aclocalDir = path.join(shareDir, 'aclocal')
        const pkgconfigDir = path.join(shareDir, 'pkgconfig')
        return fs.existsSync(aclocalDir) || fs.existsSync(pkgconfigDir) || fs.existsSync(shareDir) || hasBin
      },
      'x.org/protocol': () => {
        // X11 protocol headers in include/ or share/
        const shareDir = path.join(packageDir, 'share')
        const includeDir = path.join(packageDir, 'include')
        const pkgconfigDir = path.join(shareDir, 'pkgconfig')
        return fs.existsSync(includeDir) || fs.existsSync(pkgconfigDir) || fs.existsSync(shareDir) || hasBin
      },
      'curl.se/ca-certs': () => {
        // CA certificate bundle - check for actual cert files in various locations
        const possiblePaths = [
          path.join(packageDir, 'share'),
          path.join(packageDir, 'etc'),
          path.join(packageDir, 'ssl'),
          path.join(packageDir, 'curl.se', 'ca-certs'), // Handle nested structure
        ]

        // Also recursively check for cert files (deeper search for ca-certs)
        const hasCertFiles = (dir: string, depth = 0): boolean => {
          if (!fs.existsSync(dir) || depth > 5) // Limit recursion depth
            return false
          try {
            const entries = fs.readdirSync(dir)
            for (const entry of entries) {
              const fullPath = path.join(dir, entry)
              // Check for certificate files
              if (entry.endsWith('.pem') || entry.endsWith('.crt') || entry.includes('cert') || entry === 'cert.pem') {
                return true
              }
              // Recursively check subdirectories (especially for ca-certs nested structure)
              if (fs.statSync(fullPath).isDirectory() && entry !== 'bin' && entry !== 'lib') {
                if (hasCertFiles(fullPath, depth + 1))
                  return true
              }
            }
          }
          catch { /* ignore */ }
          return false
        }

        return possiblePaths.some(p => fs.existsSync(p)) || hasCertFiles(packageDir)
      },
      'perl.org': () => {
        // Perl is primarily a runtime, bin/ is sufficient
        return hasBin && fs.existsSync(path.join(binDir, 'perl'))
      },
    }

    // Check special cases first
    if (specialCases[domain]) {
      return specialCases[domain]()
    }

    // For library packages that are expected to have both bin/ and lib/
    const strictLibraryPackages = [
      'gnu.org/gmp',
      'openssl.org',
      'zlib.net',
      'libpng.org',
      'libsodium.org',
      'sourceware.org/libffi',
    ]

    // Only require lib/ for strict library packages, and only if they don't have working binaries
    if (strictLibraryPackages.includes(domain)) {
      // If it has working binaries, it's probably fine even without lib/
      if (hasBin) {
        try {
          const binaries = await fs.promises.readdir(binDir)
          if (binaries.length > 0) {
            return true // Has working binaries, good enough
          }
        }
        catch {
          // If we can't read binDir, fall through to lib check
        }
      }

      // For strict library packages, require either lib/ or working binaries
      return hasLib || hasLib64 || hasBin
    }

    // For most packages, having bin/ or sbin/ is sufficient
    return hasBin || hasSbin
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Error validating package ${domain}:`, error)
    }
    return true // Assume valid if we can't check
  }
}

/**
 * Create a comprehensive environment setup script for build tools
 * This script can be sourced to set up all launchpad-installed packages for building
 */
export async function createBuildEnvironmentScript(installPath: string): Promise<void> {
  const scriptPath = path.join(installPath, 'build-env.sh')

  // Build all the paths
  const libraryPaths: string[] = []
  const pkgConfigPaths: string[] = []
  const includePaths: string[] = []
  const binPaths: string[] = []

  try {
    const domains = fs.readdirSync(installPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory()
        && !['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache'].includes(dirent.name))

    for (const domainEntry of domains) {
      const domainPath = path.join(installPath, domainEntry.name)
      if (fs.existsSync(domainPath)) {
        const versions = fs.readdirSync(domainPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

        for (const versionEntry of versions) {
          const versionPath = path.join(domainPath, versionEntry.name)

          // Add library paths
          const libDirs = [
            path.join(versionPath, 'lib'),
            path.join(versionPath, 'lib64'),
          ]
          for (const libDir of libDirs) {
            if (fs.existsSync(libDir) && !libraryPaths.includes(libDir)) {
              libraryPaths.push(libDir)
            }
          }

          // Add pkg-config paths
          const pkgConfigDirs = [
            path.join(versionPath, 'lib', 'pkgconfig'),
            path.join(versionPath, 'lib64', 'pkgconfig'),
          ]
          for (const pkgConfigDir of pkgConfigDirs) {
            if (fs.existsSync(pkgConfigDir) && !pkgConfigPaths.includes(pkgConfigDir)) {
              pkgConfigPaths.push(pkgConfigDir)
            }
          }

          // Add include paths
          const includeDir = path.join(versionPath, 'include')
          if (fs.existsSync(includeDir) && !includePaths.includes(includeDir)) {
            includePaths.push(includeDir)
          }

          // Add bin paths
          const binDir = path.join(versionPath, 'bin')
          if (fs.existsSync(binDir) && !binPaths.includes(binDir)) {
            binPaths.push(binDir)
          }
        }
      }
    }
  }
  catch {
    // Ignore errors reading directories
  }

  // Create the environment setup script
  let scriptContent = `#!/bin/sh
# Launchpad Build Environment Setup Script
# Source this script to set up environment for building with launchpad-installed packages

# Set up PATH to include launchpad binaries
if [ -n "$PATH" ]; then
  export PATH="${binPaths.join(':')}:$PATH"
else
  export PATH="${binPaths.join(':')}"
fi

`

  // Set up library paths
  if (libraryPaths.length > 0) {
    const libraryPathString = libraryPaths.join(':')
    const isDarwin = process.platform === 'darwin'
    scriptContent += `# Set up library paths for dynamic linking
export LD_LIBRARY_PATH="${libraryPathString}${isDarwin ? ':$LD_LIBRARY_PATH' : ''}"
export DYLD_LIBRARY_PATH="${libraryPathString}${isDarwin ? ':$DYLD_LIBRARY_PATH' : ''}"
export DYLD_FALLBACK_LIBRARY_PATH="${libraryPathString}:/usr/local/lib:/lib:/usr/lib"

`
  }

  // Set up pkg-config paths
  if (pkgConfigPaths.length > 0) {
    const pkgConfigPathString = pkgConfigPaths.join(':')
    const existingPkgConfig = process.env.PKG_CONFIG_PATH || ''
    const pkgConfigPath = existingPkgConfig ? `${pkgConfigPathString}:${existingPkgConfig}` : pkgConfigPathString
    scriptContent += `# Set up pkg-config to find launchpad-installed libraries
export PKG_CONFIG_PATH="${pkgConfigPath}"

`
  }

  // Set up include and library paths for compilation
  if (includePaths.length > 0 || libraryPaths.length > 0) {
    const existingCppflags = process.env.CPPFLAGS || ''
    const existingLdflags = process.env.LDFLAGS || ''
    const cppflags = existingCppflags ? `-I${includePaths.join(' -I')} ${existingCppflags}` : `-I${includePaths.join(' -I')}`
    const ldflags = existingLdflags ? `-L${libraryPaths.join(' -L')} ${existingLdflags}` : `-L${libraryPaths.join(' -L')}`
    scriptContent += `# Set up include paths for compilation
export CPPFLAGS="${cppflags}"

# Set up library paths for linking
export LDFLAGS="${ldflags}"

`
  }

  scriptContent += `# Create pkg-config symlinks for common naming mismatches
# This handles cases where build scripts expect different package names
for pkg_dir in "$PKG_CONFIG_PATH"; do
  IFS=':' read -ra PKG_DIRS <<< "$pkg_dir"
  for dir in "\${PKG_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      # libpng16 -> libpng
      if [ -f "$dir/libpng16.pc" ] && [ ! -f "$dir/libpng.pc" ]; then
        ln -sf libpng16.pc "$dir/libpng.pc"
      fi

      # libturbojpeg -> libjpeg
      if [ -f "$dir/libturbojpeg.pc" ] && [ ! -f "$dir/libjpeg.pc" ]; then
        ln -sf libturbojpeg.pc "$dir/libjpeg.pc"
      fi

      # openssl -> libssl
      if [ -f "$dir/openssl.pc" ] && [ ! -f "$dir/libssl.pc" ]; then
        ln -sf openssl.pc "$dir/libssl.pc"
      fi
    fi
  done
done

# Print environment info
echo "Launchpad build environment activated:"
echo "  PATH: $PATH"
echo "  LD_LIBRARY_PATH: $LD_LIBRARY_PATH"
echo "  PKG_CONFIG_PATH: $PKG_CONFIG_PATH"
echo "  CPPFLAGS: $CPPFLAGS"
echo "  LDFLAGS: $LDFLAGS"
`

  await fs.promises.writeFile(scriptPath, scriptContent)
  await fs.promises.chmod(scriptPath, 0o755)

  if (config.verbose) {
    console.warn(`Created build environment script: ${scriptPath}`)
  }
}

/**
 * Create pkg-config symlinks for common naming mismatches
 * This handles cases where build scripts expect different package names than what's installed
 */
export async function createPkgConfigSymlinks(packageDir: string, domain: string): Promise<void> {
  const pkgConfigDir = path.join(packageDir, 'lib', 'pkgconfig')
  if (!fs.existsSync(pkgConfigDir))
    return

  const pkgConfigSymlinks: Record<string, Array<{ target: string, link: string }>> = {
    'libpng.org': [
      { target: 'libpng16.pc', link: 'libpng.pc' },
    ],
    'libjpeg-turbo.org': [
      { target: 'libturbojpeg.pc', link: 'libjpeg.pc' },
    ],
    'openssl.org': [
      { target: 'openssl.pc', link: 'libssl.pc' },
    ],
  }

  const symlinks = pkgConfigSymlinks[domain] || []

  for (const { target, link } of symlinks) {
    const targetPath = path.join(pkgConfigDir, target)
    const linkPath = path.join(pkgConfigDir, link)

    if (fs.existsSync(targetPath) && !fs.existsSync(linkPath)) {
      try {
        await fs.promises.symlink(target, linkPath)
        if (config.verbose) {
          console.warn(`Created pkg-config symlink: ${link} -> ${target}`)
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Failed to create pkg-config symlink ${link} -> ${target}:`, error)
        }
      }
    }
  }
}
