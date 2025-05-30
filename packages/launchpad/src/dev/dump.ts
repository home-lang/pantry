import { Buffer } from 'node:buffer'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import shell_escape from './shell-escape.ts'
import sniff from './sniff.ts'

const execAsync = promisify(exec)

// Helper function to get the command name from a package
function getPkgCommand(pkgName: string): string {
  // Map package names to their actual commands
  const pkgCommandMap: Record<string, string> = {
    'bun.sh': 'bun',
    'nodejs.org': 'node',
    'npmjs.com': 'npm',
    'yarnpkg.com': 'yarn',
    'pnpm.io': 'pnpm',
    'python.org': 'python',
    'pip.pypa.io': 'pip',
    'rust-lang.org': 'rustc',
    'go.dev': 'go',
    'ruby-lang.org': 'ruby',
  }

  // Return the mapped command or derive from package name
  return pkgCommandMap[pkgName] || pkgName.split('.')[0].split('/').pop() || pkgName
}

// Install packages like pkgm does - with hard links and proper directory structure
async function installPackagesPkgmStyle(packages: Array<{ project: string, version: string, command: string }>, installPrefix: string): Promise<{ successful: string[], failed: Array<{ project: string, error: string, suggestion?: string }> }> {
  const pkgx = await findPkgx()
  if (!pkgx) {
    throw new Error('pkgx not found in PATH')
  }

  // Create necessary directories
  const pkgsDir = path.join(installPrefix, 'pkgs')
  const binDir = path.join(installPrefix, 'bin')
  await fs.promises.mkdir(pkgsDir, { recursive: true })
  await fs.promises.mkdir(binDir, { recursive: true })

  const successful: string[] = []
  const failed: Array<{ project: string, error: string, suggestion?: string }> = []

  // Common package name corrections
  const packageSuggestions: Record<string, string> = {
    'wget.com': 'gnu.org/wget',
    'git.com': 'git-scm.org',
    'npm.com': 'npmjs.com',
    'yarn.com': 'yarnpkg.com',
    'docker.com': 'docker.io',
    'postgres.org': 'postgresql.org',
    'mysql.com': 'mysql.org',
    'redis.com': 'redis.io',
    'nginx.com': 'nginx.org',
    'apache.com': 'apache.org',
    'golang.org': 'go.dev',
    'rust.org': 'rust-lang.org',
    'ruby.org': 'ruby-lang.org',
    'rails.com': 'rubyonrails.org',
    'vim.com': 'vim.org',
    'neovim.com': 'neovim.io',
    'vscode.com': 'code.visualstudio.com',
  }

  for (const pkg of packages) {
    try {
      console.error(`🔄 Installing ${pkg.project}@${pkg.version} (pkgm-style)...`)

      // Query pkgx to get installation info
      const pkgSpec = pkg.version ? `+${pkg.project}@${pkg.version}` : `+${pkg.project}`
      const queryResult = await queryPkgx(pkgx, [pkgSpec])

      if (!queryResult.pkgs || queryResult.pkgs.length === 0) {
        const suggestion = packageSuggestions[pkg.project]
        const errorMsg = `Failed to resolve ${pkg.project}`
        failed.push({
          project: pkg.project,
          error: errorMsg,
          suggestion,
        })

        console.error(`❌ ${errorMsg}`)
        continue
      }

      const pkgInfo = queryResult.pkgs.find((p: { project: string, version: string, path: string }) => p.project === pkg.project)
      if (!pkgInfo) {
        const errorMsg = `Package ${pkg.project} not found in query result`
        failed.push({
          project: pkg.project,
          error: errorMsg,
        })
        console.error(`❌ ${errorMsg}`)
        continue
      }

      // Create package directory: ~/.local/pkgs/project/vX.Y.Z
      const pkgPrefix = `${pkg.project}/v${pkgInfo.version}`
      const pkgDir = path.join(pkgsDir, pkgPrefix)

      // Remove existing installation
      if (fs.existsSync(pkgDir)) {
        await fs.promises.rm(pkgDir, { recursive: true, force: true })
      }

      // Mirror the pkgx installation using hard links (like pkgm does)
      await mirrorDirectory(pkgInfo.path, pkgDir)

      // Verify that the mirroring was successful by checking for bin directories
      const binDirs = ['bin', 'sbin']
      let hasBinaries = false
      for (const binDirName of binDirs) {
        const binDir = path.join(pkgDir, binDirName)
        if (fs.existsSync(binDir)) {
          const entries = await fs.promises.readdir(binDir)
          if (entries.length > 0) {
            hasBinaries = true
            break
          }
        }
      }

      if (!hasBinaries) {
        console.error(`⚠️  No binaries found for ${pkg.project} after mirroring, skipping stub creation`)
        continue
      }

      // Create symlinks to installPrefix (like pkgm does)
      try {
        await symlinkPackage(pkgDir, installPrefix)
      }
      catch (symlinkError) {
        console.error(`⚠️  Some symlinks failed for ${pkg.project} (this is expected):`, symlinkError instanceof Error ? symlinkError.message : String(symlinkError))
      }

      // Create binary stubs (this is the crucial step - must run even if symlinks fail)
      try {
        await createBinaryStubs(pkgDir, installPrefix, pkg.project, pkg.command, queryResult.runtime_env[pkg.project] || {}, queryResult.env || {})
      }
      catch (stubError) {
        const errorMsg = `Failed to create binary stubs for ${pkg.project}: ${stubError instanceof Error ? stubError.message : String(stubError)}`
        failed.push({
          project: pkg.project,
          error: errorMsg,
        })
        console.error(`❌ ${errorMsg}`)
        // Don't throw here - continue with other packages
        continue
      }

      successful.push(`${pkg.project}@${pkgInfo.version}`)
      console.error(`✅ Installed ${pkg.project}@${pkgInfo.version}`)
    }
    catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      const suggestion = packageSuggestions[pkg.project]

      failed.push({
        project: pkg.project,
        error: errorMsg,
        suggestion,
      })

      console.error(`❌ Failed to install ${pkg.project}: ${errorMsg}`)
    }
  }

  return { successful, failed }
}

async function findPkgx(): Promise<string | null> {
  try {
    // First try with current environment
    const { stdout } = await execAsync('command -v pkgx')
    return stdout.trim()
  }
  catch {
    // If that fails, try with a more comprehensive PATH
    try {
      const comprehensivePath = [
        '/usr/local/bin',
        '/opt/homebrew/bin',
        '/usr/bin',
        '/bin',
        process.env.HOME ? `${process.env.HOME}/.local/bin` : '',
        process.env.HOME ? `${process.env.HOME}/.bun/bin` : '',
      ].filter(Boolean).join(':')

      const { stdout } = await execAsync('command -v pkgx', {
        env: { ...process.env, PATH: comprehensivePath },
      })
      return stdout.trim()
    }
    catch {
      return null
    }
  }
}

async function queryPkgx(pkgx: string, args: string[]): Promise<any> {
  // Use a clean environment to avoid broken dependencies
  const cleanEnv = {
    PATH: '/usr/local/bin:/usr/bin:/bin',
    HOME: process.env.HOME || '',
    TERM: process.env.TERM || 'xterm',
  }

  try {
    const { stdout } = await execAsync(`${pkgx} ${args.join(' ')} --json=v1`, {
      env: cleanEnv,
      encoding: 'utf8',
    })

    const json = JSON.parse(stdout)
    return {
      pkgs: json.pkgs?.map((x: any) => ({
        path: x.path,
        project: x.project,
        version: x.version,
      })) || [],
      runtime_env: json.runtime_env || {},
      env: json.env || {},
    }
  }
  catch (error) {
    console.error(`Failed to query pkgx for ${args.join(' ')}:`, error instanceof Error ? error.message : String(error))
    throw error
  }
}

async function mirrorDirectory(src: string, dst: string): Promise<void> {
  await fs.promises.mkdir(dst, { recursive: true })

  const processEntry = async (sourcePath: string, targetPath: string) => {
    const stats = await fs.promises.lstat(sourcePath)

    if (stats.isDirectory()) {
      await fs.promises.mkdir(targetPath, { recursive: true })

      const entries = await fs.promises.readdir(sourcePath)
      for (const entry of entries) {
        await processEntry(
          path.join(sourcePath, entry),
          path.join(targetPath, entry),
        )
      }
    }
    else if (stats.isFile()) {
      // Remove target if exists
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath)
      }
      // Create hard link (like pkgm does)
      await fs.promises.link(sourcePath, targetPath)
    }
    else if (stats.isSymbolicLink()) {
      const linkTarget = await fs.promises.readlink(sourcePath)
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath)
      }
      await fs.promises.symlink(linkTarget, targetPath)
    }
  }

  await processEntry(src, dst)
}

async function symlinkPackage(pkgDir: string, installPrefix: string): Promise<void> {
  const dirs = ['bin', 'sbin', 'share', 'lib', 'libexec', 'var', 'etc', 'ssl']

  for (const dir of dirs) {
    const srcDir = path.join(pkgDir, dir)
    if (!fs.existsSync(srcDir))
      continue

    const dstDir = path.join(installPrefix, dir)
    await symlinkContents(srcDir, dstDir)
  }
}

async function symlinkContents(src: string, dst: string): Promise<void> {
  await fs.promises.mkdir(dst, { recursive: true })

  const processEntry = async (sourcePath: string, targetPath: string) => {
    const stats = await fs.promises.lstat(sourcePath)

    if (stats.isDirectory()) {
      await fs.promises.mkdir(targetPath, { recursive: true })

      const entries = await fs.promises.readdir(sourcePath)
      for (const entry of entries) {
        await processEntry(
          path.join(sourcePath, entry),
          path.join(targetPath, entry),
        )
      }
    }
    else {
      // Remove existing file/symlink
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath)
      }
      // Create symlink to the package file
      await fs.promises.symlink(sourcePath, targetPath)
    }
  }

  await processEntry(src, dst)
}

async function createBinaryStubs(pkgDir: string, installPrefix: string, project: string, command: string, runtimeEnv: Record<string, string>, env: Record<string, string | string[]>): Promise<void> {
  const binDirs = ['bin', 'sbin']

  for (const binDirName of binDirs) {
    const binDir = path.join(pkgDir, binDirName)
    if (!fs.existsSync(binDir))
      continue

    const entries = await fs.promises.readdir(binDir)
    for (const entry of entries) {
      const srcBinary = path.join(binDir, entry)

      // Check if the file exists and is executable
      try {
        const stats = await fs.promises.lstat(srcBinary)

        // Skip directories
        if (stats.isDirectory())
          continue

        // For symlinks, check if the target exists
        if (stats.isSymbolicLink()) {
          try {
            await fs.promises.access(srcBinary, fs.constants.F_OK)
          }
          catch {
            console.error(`⚠️  Symlink ${srcBinary} points to non-existent target, skipping`)
            continue
          }
        }
      }
      catch (error) {
        console.error(`⚠️  Cannot access ${srcBinary}: ${error instanceof Error ? error.message : String(error)}, skipping`)
        continue
      }

      const stubPath = path.join(installPrefix, binDirName, entry)

      // Create optimized stub for better performance with prompt tools
      let stubContent = '#!/bin/sh\n'
      stubContent += `# Fast stub for ${entry} - optimized for prompt tools\n\n`

      // Only set essential environment variables (no cleanup overhead)
      const hasEnvVars = Object.keys(env).length > 0 || Object.keys(runtimeEnv).length > 0

      if (hasEnvVars) {
        // Set environment variables directly without cleanup overhead
        for (const [key, value] of Object.entries(env)) {
          if (Array.isArray(value)) {
            if (key === 'DYLD_FALLBACK_LIBRARY_PATH') {
              stubContent += `export ${key}="${value.join(':')}:/usr/lib:/usr/local/lib"\n`
            }
            else {
              stubContent += `export ${key}="${value.join(':')}"\n`
            }
          }
          else {
            stubContent += `export ${key}="${shell_escape(value)}"\n`
          }
        }

        for (const [key, value] of Object.entries(runtimeEnv)) {
          stubContent += `export ${key}="${shell_escape(value)}"\n`
        }

        stubContent += '\n'
      }

      // Direct execution - no traps, no cleanup, maximum performance
      stubContent += `exec "${srcBinary}" "$@"\n`

      // Remove existing file/symlink (this is crucial to overwrite symlinks from symlinkPackage)
      if (fs.existsSync(stubPath)) {
        try {
          await fs.promises.unlink(stubPath)
        }
        catch {
          // If unlink fails, it might be because of permissions or the file is in use
          // Try to remove with force
          try {
            await fs.promises.rm(stubPath, { force: true })
          }
          catch (rmError) {
            console.error(`Warning: Could not remove existing file at ${stubPath}:`, rmError instanceof Error ? rmError.message : String(rmError))
          }
        }
      }

      // Write optimized shell script stub and make executable
      try {
        await fs.promises.writeFile(stubPath, stubContent)
        await fs.promises.chmod(stubPath, 0o755)
        console.error(`✅ Created fast stub: ${stubPath} -> ${srcBinary}`)
      }
      catch (error) {
        console.error(`❌ Failed to create stub at ${stubPath}:`, error instanceof Error ? error.message : String(error))
        throw error // This is critical - if we can't create stubs, the package won't work
      }
    }
  }
}

export default async function (
  cwd: string,
  opts: { dryrun: boolean, quiet: boolean },
): Promise<void> {
  const snuff = await sniff({ string: cwd })

  if (snuff.pkgs.length === 0 && Object.keys(snuff.env).length === 0) {
    console.error('no devenv detected')
    process.exit(1)
  }

  // Convert version constraints that pkgx doesn't understand
  function convertVersionConstraint(constraint: string): string {
    if (constraint.startsWith('^') || constraint.startsWith('~')) {
      return constraint.slice(1)
    }
    if (constraint.startsWith('>=')) {
      return constraint.slice(2)
    }
    return constraint
  }

  const pkgspecs = snuff.pkgs.map(pkg => `+${pkg.project}@${convertVersionConstraint(pkg.constraint.toString())}`)

  if (opts.dryrun) {
    // eslint-disable-next-line no-console
    console.log(pkgspecs.join(' '))
    return
  }

  // Use project-specific installation prefix for proper isolation
  // Create a hash from the full path to ensure uniqueness - use full hash to prevent collisions
  const projectHash = Buffer.from(cwd).toString('base64').replace(/[/+=]/g, '_')
  const installPrefix = path.join(process.env.HOME || '~', '.local', 'share', 'launchpad', 'envs', projectHash)

  if (!opts.quiet) {
    console.error('🚀 Installing packages for project environment...')
    console.error(`📍 Installation prefix: ${installPrefix}`)
  }

  // Prepare packages for installation
  const packages = snuff.pkgs.map(pkg => ({
    project: pkg.project,
    version: convertVersionConstraint(pkg.constraint.toString()),
    command: getPkgCommand(pkg.project),
  }))

  try {
    // Install packages to project-specific directory
    const { successful, failed } = await installPackagesPkgmStyle(packages, installPrefix)

    if (!opts.quiet) {
      // Report installation results
      if (successful.length > 0 && failed.length === 0) {
        console.error('✅ All packages installed successfully!')
      }
      else if (successful.length > 0 && failed.length > 0) {
        console.error(`⚠️  Partial installation: ${successful.length} succeeded, ${failed.length} failed`)
        console.error('✅ Successfully installed:')
        for (const pkg of successful) {
          console.error(`  ✅ ${pkg}`)
        }
        console.error('')
        console.error('❌ Failed to install:')
        for (const { project, error, suggestion } of failed) {
          console.error(`  ❌ ${project}: ${error}`)
          if (suggestion) {
            console.error(`     💡 Did you mean '${suggestion}'? Update your dependencies file.`)
          }
        }
      }
      else if (failed.length > 0) {
        console.error('❌ All package installations failed!')
        for (const { project, error, suggestion } of failed) {
          console.error(`  ❌ ${project}: ${error}`)
          if (suggestion) {
            console.error(`     💡 Did you mean '${suggestion}'? Update your dependencies file.`)
          }
        }
      }
    }

    // Only proceed with environment setup if at least some packages were installed
    if (successful.length === 0) {
      console.error('')
      console.error('❌ No packages were successfully installed. Environment setup aborted.')
      console.error('🔧 Please fix the package specifications in your dependencies file and try again.')
      process.exit(1)
    }
  }
  catch (error) {
    console.error('❌ Installation failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  // Generate environment setup for project-specific activation
  let env = ''

  // Add any additional env that we sniffed
  for (const [key, value] of Object.entries(snuff.env)) {
    env += `${key}=${shell_escape(value)}\n`
  }

  // Set up project-specific PATH that includes the project's bin directories
  const projectBinDir = path.join(installPrefix, 'bin')
  const projectSbinDir = path.join(installPrefix, 'sbin')

  // Generate script output for shell integration with proper isolation
  // eslint-disable-next-line no-console
  console.log(`
# Project-specific environment for ${cwd}
# This creates an isolated environment that gets properly deactivated

# Store original PATH before any modifications (critical for proper restoration)
if [ -z "$_LAUNCHPAD_ORIGINAL_PATH" ]; then
  export _LAUNCHPAD_ORIGINAL_PATH="$PATH"
fi

# Store original environment variables for restoration
_LAUNCHPAD_ORIGINAL_ENV=""${Object.keys(snuff.env).map(key => `
if [ -n "$${key}" ]; then
  _LAUNCHPAD_ORIGINAL_ENV="$_LAUNCHPAD_ORIGINAL_ENV ${key}=$${key}"
else
  _LAUNCHPAD_ORIGINAL_ENV="$_LAUNCHPAD_ORIGINAL_ENV ${key}=__UNSET__"
fi`).join('')}

# Set up project-specific PATH
export PATH="${projectBinDir}:${projectSbinDir}:$_LAUNCHPAD_ORIGINAL_PATH"

# Create deactivation function
_pkgx_dev_try_bye() {
  # Check if we're still in the project directory or a subdirectory
  case "$PWD" in
    "${cwd}"|"${cwd}/"*)
      # Still in project directory, don't deactivate
      return 1
      ;;
    *)
      echo -e "\\033[31mdev environment deactivated\\033[0m" >&2

      # Restore original PATH
      if [ -n "$_LAUNCHPAD_ORIGINAL_PATH" ]; then
        export PATH="$_LAUNCHPAD_ORIGINAL_PATH"
        unset _LAUNCHPAD_ORIGINAL_PATH
      fi

      # Restore original environment variables
      if [ -n "$_LAUNCHPAD_ORIGINAL_ENV" ]; then
        for env_var in $_LAUNCHPAD_ORIGINAL_ENV; do
          if [ -n "$env_var" ]; then
            key="\${env_var%%=*}"
            value="\${env_var#*=}"
            if [ "$value" = "__UNSET__" ]; then
              unset "$key"
            else
              export "$key"="$value"
            fi
          fi
        done
        unset _LAUNCHPAD_ORIGINAL_ENV
      fi

      # Clean up project-specific environment variables${Object.keys(snuff.env).length > 0
        ? `
${Object.keys(snuff.env).map(key => `      unset ${key}`).join('\n')}`
        : ''}

      unset -f _pkgx_dev_try_bye
      ;;
  esac
}

set -a
${env}
set +a

# If we detect we're in the activated project directory, confirm activation
if [ "\${PWD}" = "${cwd}" ]; then
  echo "✅ Environment activated for ${cwd}" >&2
fi`)
}
