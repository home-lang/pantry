import { expect, test } from 'bun:test'
import { loadRecipe } from '../scripts/recipe-loader'
import { versionSatisfies } from '../scripts/build-package'

test('historical libxslt packages retain their own XML ABI without mutating the latest recipe', async () => {
  for (const platform of ['linux-x86-64', 'darwin-arm64']) {
    const current = await loadRecipe('gnome.org/libxslt', platform, '1.1.45')
    const historical = await loadRecipe('gnome.org/libxslt', platform, '1.1.43')
    const again = await loadRecipe('gnome.org/libxslt', platform, '1.1.45')
    if (!current.recipe.dependencies || !historical.recipe.dependencies) throw new Error('Missing declared runtime dependencies')
    expect(current.recipe.dependencies['gnome.org/libxml2']).toBe('~2.15.1')
    expect(historical.recipe.dependencies['gnome.org/libxml2']).toBe('~2.13')
    expect(again.recipe.dependencies).toEqual(current.recipe.dependencies)
    expect(versionSatisfies('2.15.4', historical.recipe.dependencies['gnome.org/libxml2'])).toBe(false)
    expect(versionSatisfies('2.13.9', historical.recipe.dependencies['gnome.org/libxml2'])).toBe(true)
  }
})
