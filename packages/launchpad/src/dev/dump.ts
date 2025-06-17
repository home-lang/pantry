/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { install, install_prefix } from '../install'
import shell_escape from './shell-escape.ts'
import sniff from './sniff.ts'

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

// Install packages using our new direct installation system
async function installPackagesDirectly(
  packages: Array<{ project: string, version: string, command: string, global?: boolean }>,
  installPrefix: string,
  globalInstallPrefix: string,
  opts: { shellOutput?: boolean },
): Promise<{ successful: string[], failed: Array<{ project: string, error: string, suggestion?: string }> }> {
  // Create necessary directories
  const binDir = path.join(installPrefix, 'bin')
  const globalBinDir = path.join(globalInstallPrefix, 'bin')
  await fs.promises.mkdir(binDir, { recursive: true })
  await fs.promises.mkdir(globalBinDir, { recursive: true })

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
      const targetInstallPrefix = pkg.global ? globalInstallPrefix : installPrefix
      const installType = pkg.global ? 'global' : 'project-local'

      if (config.verbose) {
        console.log(`🔄 Installing ${pkg.project}@${pkg.version} (${installType} installation)...`)
      }

      // Use our new direct installation system
      const packageSpec = pkg.version ? `${pkg.project}@${pkg.version}` : pkg.project
      const installedFiles = await install([packageSpec], targetInstallPrefix)

      if (installedFiles.length > 0) {
        successful.push(`${pkg.project}@${pkg.version}${pkg.global ? ' (global)' : ''}`)

        // Verify the binary is working (especially important for bun)
        if (pkg.project === 'bun.sh' && installedFiles.length > 0) {
          try {
            // Give the binary a moment to be fully ready
            await new Promise(resolve => setTimeout(resolve, 25))

            // Test that the binary is executable and responds
            const bunPath = installedFiles[0]
            const proc = Bun.spawn([bunPath, '--version'], {
              stdio: ['ignore', 'pipe', 'pipe'],
            })

            const result = await proc.exited
            if (result === 0) {
              if (config.verbose) {
                console.log(`✅ Verified ${pkg.project}@${pkg.version} is working`)
              }
            }
          }
          catch (error) {
            if (config.verbose) {
              console.log(`⚠️  Warning: Could not verify ${pkg.project} binary: ${error}`)
            }
          }
        }

        if (!opts.shellOutput) {
          console.log(`✅ Installed ${pkg.project}@${pkg.version}${pkg.global ? ' (global)' : ''}`)
        }
      }
      else {
        const suggestion = packageSuggestions[pkg.project]
        const errorMsg = `No binaries found after installation of ${pkg.project}`
        failed.push({
          project: pkg.project,
          error: errorMsg,
          suggestion,
        })
        console.error(`❌ ${errorMsg}`)
      }
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

export default async function (
  cwd: string,
  opts: { dryrun: boolean, quiet: boolean, shellOutput?: boolean },
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
    console.log(pkgspecs.join(' '))
    return
  }

  // Use project-specific installation prefix for proper isolation
  // Create a readable hash from the project path for better user experience
  function createReadableHash(projectPath: string): string {
    // Get the project name (last directory in path)
    const projectName = path.basename(projectPath)

    // Use Bun's built-in hash function for consistency and reliability
    const hash = Bun.hash(projectPath)

    // Convert to a readable hex string and take 8 characters for uniqueness
    const shortHash = hash.toString(16).padStart(16, '0').slice(0, 8)

    // Combine project name with short hash for readability
    // Clean project name to be filesystem-safe
    // eslint-disable-next-line regexp/strict
    const cleanProjectName = projectName.replace(/[^\w-.]/g, '-').toLowerCase()

    return `${cleanProjectName}_${shortHash}`
  }

  const projectHash = createReadableHash(cwd)
  const installPrefix = path.join(process.env.HOME || '~', '.local', 'share', 'launchpad', 'envs', projectHash)

  if (!opts.quiet && config.verbose) {
    console.log('🚀 Installing packages for project environment...')
    console.log(`📍 Installation prefix: ${installPrefix}`)
  }

  // Prepare packages for installation
  const packages = snuff.pkgs.map(pkg => ({
    project: pkg.project,
    version: convertVersionConstraint(pkg.constraint.toString()),
    command: getPkgCommand(pkg.project),
    global: pkg.global,
  }))

  // Define install prefixes
  const globalInstallPrefix = install_prefix().string

  // Temporarily silence console output in shell mode
  const originalConsoleLog = console.log
  if (opts.shellOutput) {
    console.log = () => {} // Suppress all console.log during installation
  }

  try {
    // Install packages using our new system (global and project-specific)
    const { successful, failed } = await installPackagesDirectly(packages, installPrefix, globalInstallPrefix, { shellOutput: opts.shellOutput })

    // Always show installation results unless in shell output mode
    if (!opts.shellOutput && !opts.quiet) {
      // Report installation results
      if (successful.length > 0 && failed.length === 0) {
        console.log(`✅ Successfully installed ${successful.length} ${successful.length === 1 ? 'package' : 'packages'} and set up development environment!`)
        if (config.verbose) {
          console.log('📦 Installed packages:')
          for (const pkg of successful) {
            console.log(`  • ${pkg}`)
          }
        }
        console.log('')
        console.log('🚀 To activate the environment, run:')
        console.log(`   eval "$(launchpad dev --shell)"`)
      }
      else if (successful.length > 0 && failed.length > 0) {
        console.log(`⚠️  Partial installation: ${successful.length} succeeded, ${failed.length} failed`)
        console.log('✅ Successfully installed:')
        for (const pkg of successful) {
          console.log(`  ✅ ${pkg}`)
        }
        console.log('')
        console.log('❌ Failed to install:')
        for (const { project, error, suggestion } of failed) {
          console.log(`  ❌ ${project}: ${error}`)
          if (suggestion) {
            console.log(`     💡 Did you mean '${suggestion}'? Update your dependencies file.`)
          }
        }
        console.log('')
        console.log('🚀 To activate the environment with successfully installed packages:')
        console.log(`   eval "$(launchpad dev --shell)"`)
      }
      else if (failed.length > 0) {
        console.log('❌ All package installations failed!')
        for (const { project, error, suggestion } of failed) {
          console.log(`  ❌ ${project}: ${error}`)
          if (suggestion) {
            console.log(`     💡 Did you mean '${suggestion}'? Update your dependencies file.`)
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

    // Store dependency hash for smart cache invalidation
    // Find the dependency file in the current directory
    const dependencyFiles = [
      'dependencies.yaml',
      'dependencies.yml',
      'pkgx.yaml',
      'pkgx.yml',
      '.pkgx.yaml',
      '.pkgx.yml',
      '.launchpad.yaml',
      'launchpad.yaml',
      '.launchpad.yml',
      'launchpad.yml',
      'deps.yml',
      'deps.yaml',
      '.deps.yml',
      '.deps.yaml',
    ]

    let depsFile: string | undefined
    for (const fileName of dependencyFiles) {
      const filePath = path.join(cwd, fileName)
      if (fs.existsSync(filePath)) {
        depsFile = filePath
        break
      }
    }

    if (depsFile) {
      try {
        const depsContent = fs.readFileSync(depsFile, 'utf-8')
        const depsHash = Bun.hash(depsContent).toString(16).padStart(16, '0').slice(0, 8)
        const hashFile = path.join(installPrefix, '.deps_hash')

        // Ensure the directory exists
        fs.mkdirSync(installPrefix, { recursive: true })
        fs.writeFileSync(hashFile, depsHash)

        if (!opts.quiet && config.verbose) {
          console.log(`📝 Stored dependency hash: ${depsHash}`)
        }
      }
      catch {
        // Don't fail the entire process if hash storage fails
        if (!opts.quiet && config.verbose) {
          console.log('⚠️  Warning: Could not store dependency hash for smart caching')
        }
      }
    }
  }
  catch (error) {
    console.error('❌ Installation failed:', error instanceof Error ? error.message : String(error))
    console.error('')
    console.error('🔧 Please fix the package specifications in your dependencies file and try again.')
    process.exit(1)
  }
  finally {
    // Restore console.log
    if (opts.shellOutput) {
      console.log = originalConsoleLog
    }
  }

  // Only output shell code if specifically requested
  if (opts.shellOutput) {
    // Generate environment setup for project-specific activation
    let env = ''

    // Add any additional env that we sniffed
    for (const [key, value] of Object.entries(snuff.env)) {
      env += `${key}=${shell_escape(value)}\n`
    }

    // Set up project-specific PATH that includes both global and project's bin directories
    const projectBinDir = path.join(installPrefix, 'bin')
    const projectSbinDir = path.join(installPrefix, 'sbin')
    const globalBinDir = path.join(globalInstallPrefix, 'bin')
    const globalSbinDir = path.join(globalInstallPrefix, 'sbin')

    // Generate script output for shell integration with proper isolation
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

# Set up project-specific PATH (project-local first, then global, then original)
export PATH="${projectBinDir}:${projectSbinDir}:${globalBinDir}:${globalSbinDir}:$_LAUNCHPAD_ORIGINAL_PATH"

# Create deactivation function
_pkgx_dev_try_bye() {
  # Check if we're still in the project directory or a subdirectory
  case "$PWD" in
    "${cwd}"|"${cwd}/"*)
      # Still in project directory, don't deactivate
      return 1
      ;;
    *)
      # Only show deactivation message if not silent
      if [ "$1" != "silent" ]; then
        if [ "${config.showShellMessages ? 'true' : 'false'}" = "true" ]; then
          echo -e "\\033[31m${config.shellDeactivationMessage}\\033[0m" >&2
        fi
      fi

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
  if [ "${config.showShellMessages ? 'true' : 'false'}" = "true" ]; then
    echo "${config.shellActivationMessage.replace('{path}', `\\033[3m${cwd}\\033[0m`)}" >&2
  fi

  # Give the shell a moment to recognize the new PATH before prompt detection
  # This helps prevent Starship timeout warnings when detecting tool versions
  sleep 0.1
fi`)
  }
}
