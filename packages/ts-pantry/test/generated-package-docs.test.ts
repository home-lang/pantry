import { expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { savePackageAsTypeScript } from '../src/fetch'
import { generateAliases, generateIndex } from '../src/generate'

for (const [name, domain] of [
  ['dynamodb-local', 'aws.amazon.com/dynamodb-local'],
  ['custom.tool', 'example.test/nested/tool'],
] as const) {
  test(`the generated ${name} documentation example runs against its real generated package index`, async () => {
    const directory = mkdtempSync(join(tmpdir(), 'pantry-generated-docs-'))
    try {
      const file = savePackageAsTypeScript(directory, domain, {
        name, domain, description: 'Native package documentation fixture',
        packageYmlUrl: '', homepageUrl: '', githubUrl: '',
        installCommand: `pantry install ${domain}`, pantryInstallCommand: `pantry install ${domain}`,
        programs: [name], companions: [], dependencies: [], versions: ['3.3.0'], aliases: [name],
      })
      expect(await generateIndex(directory)).toBeTruthy()
      await generateAliases(directory)
      const documented = /\* ```typescript\n([\s\S]*?)\* ```/.exec(readFileSync(file, 'utf8'))?.[1]
      expect(documented).toBeTruthy()
      const example = documented!.split('\n').map(line => line.replace(/^ \* ?/, '')).join('\n')
        .replace("from 'ts-pantry'", "from './index'")
      const executable = join(directory, 'documented-example.ts')
      writeFileSync(executable, `${example}\nexport { pkg, samePkg }\n`)
      const result = await import(pathToFileURL(executable).href)
      expect(result.pkg.domain).toBe(domain)
      expect(result.samePkg).toBe(result.pkg)
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
}
