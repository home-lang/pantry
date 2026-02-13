import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { convertDomainToVarName } from '../src/utils'

// Setup test directory
const TEST_DIR = path.join(process.cwd(), 'src', 'test-output', 'packages')

// Create test package files with hyphenated names
function createTestFiles() {
  fs.mkdirSync(TEST_DIR, { recursive: true })

  // Create a file with hyphenated variable name
  const testFile1 = path.join(TEST_DIR, 'test-domain.ts')
  fs.writeFileSync(
    testFile1,
    `
export const test-domainPackage = {
  name: 'Test Domain',
  domain: 'test-domain.com',
  description: 'A test package with hyphenated name',
  installCommand: 'pkgx test-domain.com',
  programs: ['test-domain'],
  companions: [],
  dependencies: [],
  versions: ['1.0.0'],
}

export interface test-domainPackage {
  name: string
  domain: string
  description: string
  installCommand: string
  programs: string[]
  companions: string[]
  dependencies: string[]
  versions: string[]
}
`,
  )

  // Create a file with multiple hyphenated parts
  const testFile2 = path.join(TEST_DIR, 'agwaname-git-crypt.ts')
  fs.writeFileSync(
    testFile2,
    `
export const agwaname-git-cryptPackage = {
  name: 'git-crypt',
  domain: 'agwa.name',
  description: 'Enable transparent encryption/decryption of files in a git repo',
  installCommand: 'pkgx agwa.name/git-crypt',
  programs: ['git-crypt'],
  companions: [],
  dependencies: [],
  versions: ['0.7.0'],
}

export interface agwaname-git-cryptPackage {
  name: string
  domain: string
  description: string
  installCommand: string
  programs: string[]
  companions: string[]
  dependencies: string[]
  versions: string[]
}
`,
  )

  return [testFile1, testFile2]
}

// Cleanup test files
function cleanupTestFiles() {
  if (fs.existsSync(TEST_DIR)) {
    const files = fs.readdirSync(TEST_DIR)
    for (const file of files) {
      fs.unlinkSync(path.join(TEST_DIR, file))
    }
    fs.rmdirSync(TEST_DIR)
  }
}

// Create a modified version of fixPackageVariables that works with a specified directory
async function testFixPackageVariables(directory: string): Promise<void> {
  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')

  console.error(`Found ${files.length} package files to check in test directory`)

  let fixedCount = 0

  for (const file of files) {
    const filePath = path.join(directory, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    // Extract the filename without extension
    const filenameWithoutExt = path.basename(file, '.ts')

    // Determine expected var name (without hyphens)
    const expectedVarName = convertDomainToVarName(filenameWithoutExt.replace(/-/g, '/'))
    const expectedPackageName = `${expectedVarName}Package`

    // Create patterns to find any variations of the package name with hyphens
    const exportConstPattern = /export\s+const\s+([\w-]+)Package/g
    const interfacePattern = /export\s+interface\s+([\w-]+)Package/g

    // Find and replace incorrect variable names in export statements
    let newContent = content.replace(exportConstPattern, (match, varName) => {
      if (varName.includes('-') || varName !== expectedVarName) {
        return `export const ${expectedPackageName}`
      }
      return match
    })

    // Find and replace incorrect interface names
    newContent = newContent.replace(interfacePattern, (match, varName) => {
      if (varName.includes('-') || varName !== expectedVarName) {
        return `export interface ${expectedPackageName}`
      }
      return match
    })

    // Correct variable references within the file
    if (newContent !== content) {
      const incorrectVarRefs = /(\b[\w-]+)Package(\W)/g
      newContent = newContent.replace(incorrectVarRefs, (match, varName, ending) => {
        if (varName.includes('-') || varName !== expectedVarName) {
          return `${expectedVarName}Package${ending}`
        }
        return match
      })

      // Write changes to file
      fs.writeFileSync(filePath, newContent)
      console.error(`Fixed variable names in: ${file} -> ${expectedVarName}Package`)
      fixedCount++
    }
  }

  console.error(`\nFixed hyphenated variable names in ${fixedCount} files`)
}

describe('fixPackageVariables', () => {
  beforeEach(() => {
    createTestFiles()
  })

  afterEach(() => {
    cleanupTestFiles()
  })

  test('should fix simple hyphenated variable names', async () => {
    await testFixPackageVariables(TEST_DIR)

    // Check that the first file was fixed
    const fixedContent1 = fs.readFileSync(path.join(TEST_DIR, 'test-domain.ts'), 'utf-8')

    // The expected variable name based on our conversion logic
    const expectedVarName1 = convertDomainToVarName('test/domain')

    expect(fixedContent1).toContain(`export const ${expectedVarName1}Package`)
    expect(fixedContent1).toContain(`export interface ${expectedVarName1}Package`)
    expect(fixedContent1).not.toContain('test-domainPackage')
  })

  test('should fix complex hyphenated variable names', async () => {
    await testFixPackageVariables(TEST_DIR)

    // Check that the second file was fixed
    const fixedContent2 = fs.readFileSync(path.join(TEST_DIR, 'agwaname-git-crypt.ts'), 'utf-8')

    // The expected variable name based on our conversion logic for agwa.name/git-crypt
    const expectedVarName2 = convertDomainToVarName('agwaname/git/crypt')

    expect(fixedContent2).toContain(`export const ${expectedVarName2}Package`)
    expect(fixedContent2).toContain(`export interface ${expectedVarName2}Package`)
    expect(fixedContent2).not.toContain('agwaname-git-cryptPackage')
  })
})
