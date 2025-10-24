import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { install_prefix } from './install'
import { shim_dir } from './shim'
import { isInPath } from './utils'

export interface DiagnosticResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  suggestion?: string
}

export interface DoctorReport {
  overall: 'healthy' | 'issues' | 'critical'
  results: DiagnosticResult[]
  summary: {
    passed: number
    warnings: number
    failed: number
  }
}

/**
 * Run comprehensive health checks for launchpad installation
 */
export async function runDoctorChecks(): Promise<DoctorReport> {
  const results: DiagnosticResult[] = []

  // Check installation directory
  results.push(await checkInstallationDirectory())

  // Check PATH configuration
  results.push(await checkPathConfiguration())

  // Check shim directory
  results.push(await checkShimDirectory())

  // Check permissions
  results.push(await checkPermissions())

  // Check shell integration
  results.push(await checkShellIntegration())

  // Check system dependencies
  results.push(await checkSystemDependencies())

  // Check network connectivity
  results.push(await checkNetworkConnectivity())

  // Check PHP extensions
  results.push(await checkPhpExtensions())

  // Check starship configuration
  results.push(await checkStarshipConfiguration())

  // Calculate summary
  const summary = {
    passed: results.filter(r => r.status === 'pass').length,
    warnings: results.filter(r => r.status === 'warn').length,
    failed: results.filter(r => r.status === 'fail').length,
  }

  // Determine overall health
  let overall: DoctorReport['overall'] = 'healthy'
  if (summary.failed > 0) {
    overall = 'critical'
  }
  else if (summary.warnings > 0) {
    overall = 'issues'
  }

  return {
    overall,
    results,
    summary,
  }
}

async function checkInstallationDirectory(): Promise<DiagnosticResult> {
  try {
    const installPath = install_prefix()
    const binDir = path.join(installPath.string, 'bin')
    const sbinDir = path.join(installPath.string, 'sbin')

    if (!fs.existsSync(installPath.string)) {
      return {
        name: 'Installation Directory',
        status: 'fail',
        message: `Installation directory does not exist: ${installPath.string}`,
        suggestion: 'Run "launchpad bootstrap" to set up the installation directory',
      }
    }

    if (!fs.existsSync(binDir)) {
      return {
        name: 'Installation Directory',
        status: 'warn',
        message: `Binary directory missing: ${binDir}`,
        suggestion: 'Run "launchpad bootstrap" to create missing directories',
      }
    }

    if (!fs.existsSync(sbinDir)) {
      return {
        name: 'Installation Directory',
        status: 'warn',
        message: `System binary directory missing: ${sbinDir}`,
        suggestion: 'Run "launchpad bootstrap" to create missing directories',
      }
    }

    // Check if directory is writable
    try {
      const testFile = path.join(installPath.string, '.launchpad-test')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
    }
    catch {
      return {
        name: 'Installation Directory',
        status: 'fail',
        message: `Installation directory is not writable: ${installPath.string}`,
        suggestion: 'Check directory permissions or run with appropriate privileges',
      }
    }

    return {
      name: 'Installation Directory',
      status: 'pass',
      message: `Installation directory is properly configured: ${installPath.string}`,
    }
  }
  catch (error) {
    return {
      name: 'Installation Directory',
      status: 'fail',
      message: `Error checking installation directory: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Try running "launchpad bootstrap" to reinitialize the installation',
    }
  }
}

async function checkPathConfiguration(): Promise<DiagnosticResult> {
  try {
    const installPath = install_prefix()
    const binDir = path.join(installPath.string, 'bin')
    const sbinDir = path.join(installPath.string, 'sbin')

    const binInPath = isInPath(binDir)
    const sbinInPath = isInPath(sbinDir)

    if (!binInPath && !sbinInPath) {
      return {
        name: 'PATH Configuration',
        status: 'fail',
        message: 'Neither bin nor sbin directories are in PATH',
        suggestion: `Add ${binDir} to your PATH environment variable`,
      }
    }

    if (!binInPath) {
      return {
        name: 'PATH Configuration',
        status: 'warn',
        message: `Binary directory not in PATH: ${binDir}`,
        suggestion: `Add ${binDir} to your PATH environment variable`,
      }
    }

    if (!sbinInPath) {
      return {
        name: 'PATH Configuration',
        status: 'warn',
        message: `System binary directory not in PATH: ${sbinDir}`,
        suggestion: `Consider adding ${sbinDir} to your PATH environment variable`,
      }
    }

    return {
      name: 'PATH Configuration',
      status: 'pass',
      message: 'Installation directories are properly configured in PATH',
    }
  }
  catch (error) {
    return {
      name: 'PATH Configuration',
      status: 'fail',
      message: `Error checking PATH configuration: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Check your shell configuration files and PATH environment variable',
    }
  }
}

async function checkShimDirectory(): Promise<DiagnosticResult> {
  try {
    const shimPath = shim_dir()

    if (!fs.existsSync(shimPath.string)) {
      return {
        name: 'Shim Directory',
        status: 'warn',
        message: `Shim directory does not exist: ${shimPath.string}`,
        suggestion: 'Shim directory will be created automatically when needed',
      }
    }

    const shimInPath = isInPath(shimPath.string)
    if (!shimInPath) {
      return {
        name: 'Shim Directory',
        status: 'warn',
        message: `Shim directory not in PATH: ${shimPath.string}`,
        suggestion: `Add ${shimPath.string} to your PATH environment variable`,
      }
    }

    return {
      name: 'Shim Directory',
      status: 'pass',
      message: `Shim directory is properly configured: ${shimPath.string}`,
    }
  }
  catch (error) {
    return {
      name: 'Shim Directory',
      status: 'fail',
      message: `Error checking shim directory: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Check directory permissions and reinstall launchpad if necessary',
    }
  }
}

async function checkPermissions(): Promise<DiagnosticResult> {
  try {
    const installPath = install_prefix()
    const homeDir = os.homedir()

    // Check if we're installing to a system directory
    const isSystemInstall = installPath.string.startsWith('/usr/') || installPath.string.startsWith('/opt/')

    if (isSystemInstall && process.getuid && process.getuid() !== 0) {
      // Check if we can write to the system directory
      try {
        const testFile = path.join(installPath.string, '.permission-test')
        fs.writeFileSync(testFile, 'test')
        fs.unlinkSync(testFile)
      }
      catch {
        return {
          name: 'Permissions',
          status: 'warn',
          message: 'Installing to system directory without root privileges',
          suggestion: 'Consider using a user directory or run with sudo when needed',
        }
      }
    }

    // Check home directory access
    if (!fs.existsSync(homeDir)) {
      return {
        name: 'Permissions',
        status: 'fail',
        message: 'Cannot access home directory',
        suggestion: 'Check HOME environment variable and directory permissions',
      }
    }

    return {
      name: 'Permissions',
      status: 'pass',
      message: 'File system permissions are properly configured',
    }
  }
  catch (error) {
    return {
      name: 'Permissions',
      status: 'fail',
      message: `Error checking permissions: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Check file and directory permissions for your home directory and launchpad installation',
    }
  }
}

async function checkShellIntegration(): Promise<DiagnosticResult> {
  try {
    const shell = process.env.SHELL || ''
    const homeDir = os.homedir()

    if (!shell) {
      return {
        name: 'Shell Integration',
        status: 'warn',
        message: 'SHELL environment variable not set',
        suggestion: 'Set SHELL environment variable for better shell integration',
      }
    }

    // Check for common shell config files
    const shellName = path.basename(shell)
    const configFiles = {
      zsh: ['.zshrc', '.zprofile'],
      bash: ['.bashrc', '.bash_profile', '.profile'],
      fish: ['.config/fish/config.fish'],
    }

    const possibleConfigs = configFiles[shellName as keyof typeof configFiles] || ['.profile']
    const existingConfigs = possibleConfigs.filter(config =>
      fs.existsSync(path.join(homeDir, config)),
    )

    if (existingConfigs.length === 0) {
      return {
        name: 'Shell Integration',
        status: 'warn',
        message: `No shell configuration files found for ${shellName}`,
        suggestion: `Create a shell configuration file (e.g., ${possibleConfigs[0]}) for persistent PATH changes`,
      }
    }

    return {
      name: 'Shell Integration',
      status: 'pass',
      message: `Shell integration available for ${shellName}`,
    }
  }
  catch (error) {
    return {
      name: 'Shell Integration',
      status: 'fail',
      message: `Error checking shell integration: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Try running "launchpad dev:shellcode" to regenerate shell integration or check your shell configuration',
    }
  }
}

async function checkSystemDependencies(): Promise<DiagnosticResult> {
  try {
    const platform = os.platform()
    const arch = os.arch()

    // Check for required system tools
    const requiredTools = ['curl', 'tar']
    const missingTools: string[] = []

    for (const tool of requiredTools) {
      try {
        // Try to find the tool in PATH
        const { execSync } = await import('node:child_process')
        execSync(`which ${tool}`, { stdio: 'ignore' })
      }
      catch {
        missingTools.push(tool)
      }
    }

    if (missingTools.length > 0) {
      return {
        name: 'System Dependencies',
        status: 'fail',
        message: `Missing required system tools: ${missingTools.join(', ')}`,
        suggestion: 'Install missing tools using your system package manager',
      }
    }

    // Check platform support
    const supportedPlatforms = ['darwin', 'linux', 'win32']
    if (!supportedPlatforms.includes(platform)) {
      return {
        name: 'System Dependencies',
        status: 'warn',
        message: `Platform ${platform} may not be fully supported`,
        suggestion: 'Some features may not work correctly on this platform',
      }
    }

    return {
      name: 'System Dependencies',
      status: 'pass',
      message: `System dependencies are available (${platform}/${arch})`,
    }
  }
  catch (error) {
    return {
      name: 'System Dependencies',
      status: 'fail',
      message: `Error checking system dependencies: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Install required system tools using your system package manager (brew, apt, yum, etc.)',
    }
  }
}

async function checkNetworkConnectivity(): Promise<DiagnosticResult> {
  try {
    // Test connectivity to the package distribution server
    const testUrl = 'https://dist.pkgx.sh'

    const response = await fetch(testUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      return {
        name: 'Network Connectivity',
        status: 'warn',
        message: `Package server returned ${response.status}: ${response.statusText}`,
        suggestion: 'Check your internet connection and firewall settings',
      }
    }

    return {
      name: 'Network Connectivity',
      status: 'pass',
      message: 'Package distribution server is accessible',
    }
  }
  catch (error) {
    return {
      name: 'Network Connectivity',
      status: 'fail',
      message: `Cannot reach package distribution server: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Check your internet connection and firewall settings',
    }
  }
}

/**
 * Check PHP extensions and provide installation guidance
 */
async function checkPhpExtensions(): Promise<DiagnosticResult> {
  try {
    // Check if PHP is available
    const { execSync } = await import('node:child_process')
    const phpVersion = execSync('php --version', { encoding: 'utf8', timeout: 5000 })

    if (!phpVersion.includes('PHP')) {
      return {
        name: 'PHP Extensions',
        status: 'warn',
        message: 'PHP not found',
        suggestion: 'PHP is not installed or not in PATH. Consider installing it for database extensions.',
      }
    }

    // Check for common database extensions
    const commonExtensions = ['pdo_mysql', 'pdo_pgsql', 'pdo_sqlite', 'mysqli', 'pgsql']
    const extensionResults: Record<string, boolean> = {}

    for (const ext of commonExtensions) {
      try {
        const result = execSync(`php -m | grep -i "^${ext}$"`, { encoding: 'utf8', timeout: 5000 })
        extensionResults[ext] = result.trim().length > 0
      }
      catch {
        extensionResults[ext] = false
      }
    }

    // Check if any database extension is available
    const dbExtensions = ['pdo_mysql', 'pdo_pgsql', 'pdo_sqlite', 'mysqli', 'pgsql']
    const hasDbExtension = dbExtensions.some(ext => extensionResults[ext])

    if (!hasDbExtension) {
      return {
        name: 'PHP Extensions',
        status: 'warn',
        message: 'No database extensions found',
        suggestion: 'Consider installing PHP with database extensions or use SQLite (which is usually included)',
      }
    }

    // Specific extension recommendations
    if (!extensionResults.pdo_sqlite) {
      return {
        name: 'PHP Extensions',
        status: 'warn',
        message: 'SQLite extension missing',
        suggestion: 'SQLite extension missing - this is the most compatible option for development',
      }
    }

    if (!extensionResults.pdo_pgsql && !extensionResults.pgsql) {
      return {
        name: 'PHP Extensions',
        status: 'warn',
        message: 'PostgreSQL extensions missing',
        suggestion: 'PostgreSQL extensions missing - needed for PostgreSQL databases',
      }
    }

    if (!extensionResults.pdo_mysql && !extensionResults.mysqli) {
      return {
        name: 'PHP Extensions',
        status: 'warn',
        message: 'MySQL extensions missing',
        suggestion: 'MySQL extensions missing - needed for MySQL/MariaDB databases',
      }
    }

    return {
      name: 'PHP Extensions',
      status: 'pass',
      message: 'Core database extensions are available',
    }
  }
  catch (error) {
    return {
      name: 'PHP Extensions',
      status: 'fail',
      message: `Error checking PHP extensions: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Install PHP and required extensions, or check PHP configuration',
    }
  }
}

/**
 * Check starship configuration for compatibility with launchpad
 */
async function checkStarshipConfiguration(): Promise<DiagnosticResult> {
  try {
    const homeDir = os.homedir()

    // Check if starship is installed
    let starshipInstalled = false
    try {
      const { execSync } = await import('node:child_process')
      execSync('which starship', { stdio: 'ignore', timeout: 3000 })
      starshipInstalled = true
    }
    catch {
      // Starship not installed, this is not an error
      return {
        name: 'Starship Configuration',
        status: 'pass',
        message: 'Starship not installed - no configuration issues',
      }
    }

    if (!starshipInstalled) {
      return {
        name: 'Starship Configuration',
        status: 'pass',
        message: 'Starship not installed - no configuration issues',
      }
    }

    // Check starship configuration file for invalid entries
    const starshipConfigPath = path.join(homeDir, '.config', 'starship.toml')
    let hasConfigIssues = false
    const configIssues: string[] = []

    if (fs.existsSync(starshipConfigPath)) {
      try {
        const configContent = fs.readFileSync(starshipConfigPath, 'utf8')

        // Check for the specific invalid line that causes issues
        if (configContent.includes('get = "format"')) {
          hasConfigIssues = true
          configIssues.push('Invalid "get = \\"format\\"" line found')
        }

        // Check for other common configuration issues
        const lines = configContent.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line.startsWith('get =') && !line.includes('# ')) {
            hasConfigIssues = true
            configIssues.push(`Invalid "get" configuration on line ${i + 1}`)
          }
        }
      }
      catch (error) {
        return {
          name: 'Starship Configuration',
          status: 'warn',
          message: `Cannot read starship configuration: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: 'Check starship configuration file permissions',
        }
      }
    }

    // Check shell configuration for proper launchpad/starship order
    const shellConfigIssues: string[] = []
    const zshrcPath = path.join(homeDir, '.zshrc')

    if (fs.existsSync(zshrcPath)) {
      try {
        const zshrcContent = fs.readFileSync(zshrcPath, 'utf8')
        const lines = zshrcContent.split('\n')

        let launchpadLine = -1
        let starshipLine = -1

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line.includes('launchpad dev:shellcode') && !line.startsWith('#')) {
            launchpadLine = i
          }
          if (line.includes('starship init') && !line.startsWith('#')) {
            starshipLine = i
          }
        }

        // Check if both are present and in wrong order
        if (launchpadLine !== -1 && starshipLine !== -1 && starshipLine < launchpadLine) {
          // Starship loads before launchpad - this is wrong
          shellConfigIssues.push('Starship loads before launchpad shellcode (should load after)')
        }
        else if (launchpadLine !== -1 && starshipLine !== -1 && launchpadLine < starshipLine) {
          // Launchpad loads before starship - this is correct, no issue
        }
      }
      catch {
        // Ignore errors reading zshrc
      }
    }

    // Determine result based on issues found
    if (hasConfigIssues) {
      return {
        name: 'Starship Configuration',
        status: 'fail',
        message: `Starship configuration issues detected: ${configIssues.join(', ')}`,
        suggestion: 'Remove invalid "get = \\"format\\"" line from ~/.config/starship.toml. This line causes starship initialization to fail silently.',
      }
    }

    if (shellConfigIssues.length > 0) {
      return {
        name: 'Starship Configuration',
        status: 'warn',
        message: `Shell configuration issues: ${shellConfigIssues.join(', ')}`,
        suggestion: 'Ensure "eval \\"$(starship init zsh)\\"" loads AFTER "eval \\"$(launchpad dev:shellcode)\\"" in your ~/.zshrc for proper prompt initialization',
      }
    }

    return {
      name: 'Starship Configuration',
      status: 'pass',
      message: 'Starship configuration is compatible with launchpad',
    }
  }
  catch (error) {
    return {
      name: 'Starship Configuration',
      status: 'fail',
      message: `Error checking starship configuration: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Check starship installation and configuration files',
    }
  }
}

/**
 * Format doctor report for CLI display
 */
export function formatDoctorReport(report: DoctorReport): string {
  const lines: string[] = []

  // Header
  lines.push('🩺 Launchpad Health Check')
  lines.push('='.repeat(50))
  lines.push('')

  // Overall status
  const statusEmoji = {
    healthy: '✅',
    issues: '⚠️',
    critical: '❌',
  }[report.overall]

  const statusMessage = {
    healthy: 'All systems operational',
    issues: 'Some issues detected',
    critical: 'Critical issues found',
  }[report.overall]

  lines.push(`${statusEmoji} Overall Status: ${statusMessage}`)
  lines.push('')

  // Individual checks
  lines.push('Diagnostic Results:')
  lines.push('-'.repeat(30))

  for (const result of report.results) {
    const emoji = {
      pass: '✅',
      warn: '⚠️',
      fail: '❌',
    }[result.status]

    lines.push(`${emoji} ${result.name}`)
    lines.push(`   ${result.message}`)

    if (result.suggestion) {
      lines.push(`   💡 ${result.suggestion}`)
    }
    lines.push('')
  }

  // Summary
  lines.push('Summary:')
  lines.push('-'.repeat(20))
  lines.push(`✅ Passed: ${report.summary.passed}`)
  lines.push(`⚠️  Warnings: ${report.summary.warnings}`)
  lines.push(`❌ Failed: ${report.summary.failed}`)

  if (report.overall !== 'healthy') {
    lines.push('')
    lines.push('💡 Run "launchpad bootstrap" to fix common issues')
  }

  return lines.join('\n')
}
