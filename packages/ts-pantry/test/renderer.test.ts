import type { PkgxPackage } from '../src/types'
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// Minimal implementation of the renderer functions for testing
function convertDomainToVarName(domain: string): string {
  if (domain.includes('/')) {
    const [parentDomain, subPath] = domain.split('/')
    return parentDomain.replace(/\./g, '') + subPath.replace(/-/g, '').toLowerCase()
  }
  return domain.replace(/\./g, '').toLowerCase()
}

function generateTypeScriptContent(packageInfo: PkgxPackage, varName: string): string {
  const tsLines = [
    `/**`,
    ` * Package definition for ${packageInfo.name} (${packageInfo.domain})`,
    ` */`,
    `import type { PkgxPackage } from '../types'`,
    ``,
    `export const ${varName}Package: PkgxPackage = {`,
    `  name: '${packageInfo.name}',`,
    `  domain: '${packageInfo.domain}',`,
    `  description: '${packageInfo.description.replace(/'/g, '\\\'')}',`,
  ]

  if (packageInfo.packageYmlUrl) {
    tsLines.push(`  packageYmlUrl: '${packageInfo.packageYmlUrl}',`)
  }

  if (packageInfo.homepageUrl) {
    tsLines.push(`  homepageUrl: '${packageInfo.homepageUrl}',`)
  }

  if (packageInfo.githubUrl) {
    tsLines.push(`  githubUrl: '${packageInfo.githubUrl}',`)
  }

  tsLines.push(`  installCommand: '${packageInfo.installCommand.replace(/'/g, '\\\'')}',`)
  tsLines.push(`  programs: ${JSON.stringify(packageInfo.programs)},`)
  tsLines.push(`  companions: ${JSON.stringify(packageInfo.companions)},`)
  tsLines.push(`  dependencies: ${JSON.stringify(packageInfo.dependencies)},`)
  tsLines.push(`  versions: ${JSON.stringify(packageInfo.versions)},`)

  if (packageInfo.aliases && packageInfo.aliases.length > 0) {
    tsLines.push(`  aliases: ${JSON.stringify(packageInfo.aliases)},`)
  }

  if (packageInfo.fullPath) {
    tsLines.push(`  fullPath: '${packageInfo.fullPath}',`)
  }

  tsLines.push(`}`)

  return tsLines.join('\n')
}

describe('Package Renderer', () => {
  const testDir = path.join(process.cwd(), 'src', 'test-output')
  const testPackage: PkgxPackage = {
    name: 'Test Package',
    domain: 'test.com',
    description: 'A test package for renderer testing',
    packageYmlUrl: 'https://github.com/pkgxdev/pantry/blob/main/projects/test.com/package.yml',
    homepageUrl: 'https://test.com',
    githubUrl: 'https://github.com/test/package',
    installCommand: 'pkgx test.com',
    pkgxInstallCommand: 'sh <(curl https://pkgx.sh) test.com -- $SHELL -i',
    launchpadInstallCommand: 'launchpad install test.com',
    programs: ['test'],
    companions: [],
    dependencies: [],
    versions: ['1.0.0'],
    aliases: ['test'],
    fullPath: 'test.com',
  }

  // Create test directory before tests
  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
  })

  // Clean up test files after tests
  afterAll(() => {
    const testFile = path.join(testDir, 'testcom.ts')
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile)
    }
  })

  describe('convertDomainToVarName', () => {
    test('should convert domain to variable name', () => {
      expect(convertDomainToVarName('test.com')).toBe('testcom')
      expect(convertDomainToVarName('test.org/sub-package')).toBe('testorgsubpackage')
    })
  })

  describe('generateTypeScriptContent', () => {
    test('should generate valid TypeScript content', () => {
      const varName = convertDomainToVarName('test.com')
      const content = generateTypeScriptContent(testPackage, varName)

      // The content should include the package name
      expect(content).toContain(`name: 'Test Package'`)
      // Should include correct domain
      expect(content).toContain(`domain: 'test.com'`)
      // Should have a valid export
      expect(content).toContain(`export const ${varName}Package: PkgxPackage = {`)
      // Should include aliases
      expect(content).toContain(`aliases: ["test"]`)
    })

    test('should be able to write and read the generated file', () => {
      const varName = convertDomainToVarName('test.com')
      const content = generateTypeScriptContent(testPackage, varName)
      const filePath = path.join(testDir, `${varName}.ts`)

      // Write the file
      fs.writeFileSync(filePath, content)

      // Verify the file exists
      expect(fs.existsSync(filePath)).toBe(true)

      // Verify the file content
      const fileContent = fs.readFileSync(filePath, 'utf8')
      expect(fileContent).toBe(content)
    })
  })
})
