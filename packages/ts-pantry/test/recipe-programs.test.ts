import { expect, test } from 'bun:test'
import { loadRecipe } from '../scripts/recipe-loader'
import { recipe as tcl } from '../src/recipes/tcl-lang.org'
import { recipe as glslang } from '../src/recipes/khronos.org/glslang'
import { recipe as harfbuzz } from '../src/recipes/harfbuzz.org'

test('normalization preserves program declarations used to regenerate installer catalogs', async () => {
  for (const definition of [tcl, glslang, harfbuzz]) {
    const loaded = await loadRecipe(definition.domain)
    expect(loaded.recipe.programs).toEqual(definition.programs)
  }
})
