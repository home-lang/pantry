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
async function installPackagesPkgmStyle(packages: Array<{ project: string, version: string, command: string }>, installPrefix: string): Promise<void> {
  const pkgx = await findPkgx()
  if (!pkgx) {
    throw new Error('pkgx not found in PATH')
  }

  // Create necessary directories
  const pkgsDir = path.join(installPrefix, 'pkgs')
  const binDir = path.join(installPrefix, 'bin')
  await fs.promises.mkdir(pkgsDir, { recursive: true })
  await fs.promises.mkdir(binDir, { recursive: true })

  for (const pkg of packages) {
    try {
      console.error(`🔄 Installing ${pkg.project}@${pkg.version} (pkgm-style)...`)

      // Query pkgx to get installation info
      const pkgSpec = pkg.version ? `+${pkg.project}@${pkg.version}` : `+${pkg.project}`
      const queryResult = await queryPkgx(pkgx, [pkgSpec])

      if (!queryResult.pkgs || queryResult.pkgs.length === 0) {
        console.error(`❌ Failed to resolve ${pkg.project}`)
        continue
      }

      const pkgInfo = queryResult.pkgs.find((p: { project: string, version: string, path: string }) => p.project === pkg.project)
      if (!pkgInfo) {
        console.error(`❌ Package ${pkg.project} not found in query result`)
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
        await createBinaryStubs(pkgDir, installPrefix, pkg.project, pkg.command, queryResult.runtime_env[pkg.project] || {})
      }
      catch (stubError) {
        console.error(`❌ Failed to create binary stubs for ${pkg.project}:`, stubError instanceof Error ? stubError.message : String(stubError))
        // Don't throw here - continue with other packages
        continue
      }

      console.error(`✅ Installed ${pkg.project}@${pkgInfo.version}`)
    }
    catch (error) {
      console.error(`❌ Failed to install ${pkg.project}:`, error instanceof Error ? error.message : String(error))
    }
  }
}

async function findPkgx(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('command -v pkgx')
    return stdout.trim()
  }
  catch {
    return null
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

async function createBinaryStubs(pkgDir: string, installPrefix: string, project: string, command: string, runtimeEnv: Record<string, string>): Promise<void> {
  const binDirs = ['bin', 'sbin']

  for (const binDirName of binDirs) {
    const binDir = path.join(pkgDir, binDirName)
    if (!fs.existsSync(binDir)) {
      console.error(`⚠️  Binary directory ${binDir} does not exist for ${project}`)
      continue
    }

    const entries = await fs.promises.readdir(binDir)
    for (const entry of entries) {
      const srcBinary = path.join(binDir, entry)

      // Validate that the source binary actually exists and is accessible
      try {
        const stats = await fs.promises.lstat(srcBinary)
        if (!stats.isFile() && !stats.isSymbolicLink()) {
          console.error(`⚠️  ${srcBinary} is not a file or symlink, skipping`)
          continue
        }

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

      // Create environment setup
      let stubContent = '#!/bin/sh\n'
      for (const [key, value] of Object.entries(runtimeEnv)) {
        stubContent += `export ${key}="${value}"\n`
      }

      stubContent += '\n'

      // Add the actual binary execution (like pkgm does)
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

      // Write shell script stub and make executable
      try {
        await fs.promises.writeFile(stubPath, stubContent)
        await fs.promises.chmod(stubPath, 0o755)
        console.error(`✅ Created shell script stub: ${stubPath} -> ${srcBinary}`)
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

  // Determine installation prefix (like pkgm does)
  const installPrefix = isWritable('/usr/local') ? '/usr/local' : path.join(process.env.HOME || '~', '.local')

  if (!opts.quiet) {
    console.error('🚀 Installing packages pkgm-style...')
    console.error(`📍 Installation prefix: ${installPrefix}`)
  }

  // Prepare packages for installation
  const packages = snuff.pkgs.map(pkg => ({
    project: pkg.project,
    version: convertVersionConstraint(pkg.constraint.toString()),
    command: getPkgCommand(pkg.project),
  }))

  try {
    // Install packages like pkgm does
    await installPackagesPkgmStyle(packages, installPrefix)

    // Ensure bin directory is in PATH
    const binDir = path.join(installPrefix, 'bin')
    if (!isInPath(binDir)) {
      console.error(`⚠️  ${binDir} not in $PATH`)
    }

    if (!opts.quiet) {
      console.error('✅ Packages installed successfully!')
    }
  }
  catch (error) {
    console.error('❌ Installation failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  // Generate environment setup for compatibility
  let env = ''

  // Add any additional env that we sniffed
  for (const [key, value] of Object.entries(snuff.env)) {
    env += `${key}=${shell_escape(value)}\n`
  }

  // Ensure PATH includes the bin directory
  env += `PATH=${shell_escape(`${path.join(installPrefix, 'bin')}:$PATH`)}\n`

  env = env.trim()

  // Generate script output for shell integration
  // eslint-disable-next-line no-console
  console.log(`
  # Packages installed pkgm-style to ${installPrefix}
  # Ensuring PATH includes installation directory
  export PATH="${path.join(installPrefix, 'bin')}:$PATH"

  eval "_pkgx_dev_try_bye() {
    suffix=\\"\\\${PWD#\\"${cwd}\\"}\\"
    [ \\"\\$PWD\\" = \\"${cwd}\\$suffix\\" ] && return 1
    echo -e \\"\\033[31mdev environment deactivated\\033[0m\\" >&2
    unset -f _pkgx_dev_try_bye
  }"

  set -a
  ${env}
  set +a

  # If we detect we're in the activated project directory, confirm activation
  if [ "\${PWD}" = "${cwd}" ]; then
    echo "✅ Environment activated for ${cwd}" >&2
  fi`)
}

function isWritable(dirPath: string): boolean {
  try {
    const testDir = path.join(dirPath, '.writable_test')
    fs.mkdirSync(testDir, { recursive: true })
    fs.rmSync(testDir, { recursive: true })
    return true
  }
  catch {
    return false
  }
}

function isInPath(dir: string): boolean {
  const pathDirs = (process.env.PATH || '').split(':')
  return pathDirs.includes(dir)
}
