import { expect, test } from 'bun:test'
import { loadRecipe } from '../scripts/recipe-loader'
import { mavenVersions } from '../scripts/maven-versions'
import { copyRecipeProps } from '../scripts/copy-recipe-props'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

test('DynamoDB Local has a native Pantry provider with a managed JVM and mandatory health check', async () => {
  const loaded = await loadRecipe('aws.amazon.com/dynamodb-local', 'linux/x86-64', '3.3.0')
  expect(loaded.source).toBe('recipe')
  expect(loaded.recipe.platforms).toContain('linux/x86-64')
  expect(loaded.recipe.programs).toContain('dynamodb-local')
  expect(loaded.recipe.dependencies?.['openjdk.org']).toBe('>=17')
  expect(loaded.recipe.build?.dependencies?.['maven.apache.org']).toBe('^3')
  expect(loaded.recipe.build?.dependencies?.['bun.com']).toBe('>=1.3')
  expect(loaded.recipe.test?.required).toBe(true)
  expect(loaded.recipe.test?.script?.length).toBeGreaterThan(0)
  expect(JSON.stringify(loaded.recipe)).not.toMatch(/\b(?:docker|podman)\b/i)
  expect(loaded.propsDir).toBeTruthy()
  expect(readFileSync(join(loaded.propsDir!, 'health.ts'), 'utf8')).toContain("'CreateTable'")
})

test('Maven discovery keeps exact stable artifact versions and rejects unavailable metadata', async () => {
  expect(await mavenVersions('software.amazon.dynamodb', 'DynamoDBLocal', async (url) => {
    expect(url).toBe('https://repo.maven.apache.org/maven2/software/amazon/dynamodb/DynamoDBLocal/maven-metadata.xml')
    return new Response('<versions><version>3.3.0</version><version>3.10.0</version><version>3.3.0</version><version>4.0.0-SNAPSHOT</version></versions>')
  })).toEqual(['3.10.0', '3.3.0'])
  await expect(mavenVersions('../escape', 'DynamoDBLocal')).rejects.toThrow('Invalid Maven artifact coordinates')
  await expect(mavenVersions('software.amazon.dynamodb', 'DynamoDBLocal', async () => new Response(null, { status: 503 }))).rejects.toThrow('HTTP 503')
  await expect(mavenVersions('software.amazon.dynamodb', 'DynamoDBLocal', async () => new Response('<versions/>'))).rejects.toThrow('no stable versions')
})

test('buildkit retains executable TypeScript assets from an explicit recipe props directory', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-recipe-props-'))
  try {
    const props = join(root, 'source assets')
    mkdirSync(join(props, 'nested'), { recursive: true })
    writeFileSync(join(props, 'health.ts'), 'export const requiredHealth = true\n')
    writeFileSync(join(props, 'nested', 'fixture.txt'), 'native fixture\n')
    const output = join(root, 'build props')
    expect(copyRecipeProps(props, output, true).sort()).toEqual(['health.ts', 'nested'])
    expect(readFileSync(join(output, 'health.ts'), 'utf8')).toBe('export const requiredHealth = true\n')
    expect(readFileSync(join(output, 'nested', 'fixture.txt'), 'utf8')).toBe('native fixture\n')
    expect(copyRecipeProps(props, join(root, 'legacy'), false)).toEqual(['nested'])
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})
