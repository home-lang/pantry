import { expect, test } from 'bun:test'
import { loadRecipe } from '../scripts/recipe-loader'

test('DynamoDB Local has a native Pantry provider with a managed JVM and mandatory health check', async () => {
  const loaded = await loadRecipe('aws.amazon.com/dynamodb-local', 'linux/x86-64', '3.3.0')
  expect(loaded.source).toBe('recipe')
  expect(loaded.recipe.platforms).toContain('linux/x86-64')
  expect(loaded.recipe.programs).toContain('dynamodb-local')
  expect(loaded.recipe.dependencies).toHaveProperty('openjdk.org')
  expect(loaded.recipe.build?.dependencies).toHaveProperty('maven.apache.org')
  expect(loaded.recipe.test?.required).toBe(true)
  expect(loaded.recipe.test?.script?.length).toBeGreaterThan(0)
  expect(JSON.stringify(loaded.recipe)).not.toMatch(/\b(?:docker|podman)\b/i)
})
