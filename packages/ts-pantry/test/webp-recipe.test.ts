import { expect, test } from 'bun:test'
import { loadRecipe } from '../scripts/recipe-loader'
import { recipe } from '../src/recipes/google.com/webp'
import { recipe as freeglut } from '../src/recipes/freeglut.sourceforge.io'
import { recipe as mesa } from '../src/recipes/mesa3d.org'

test('the managed GLUT graph includes Mesa DRM without adding it to macOS', async () => {
  expect(mesa.dependencies?.linux).toMatchObject({ 'dri.freedesktop.org': '^2.4.110' })
  const linux = (await loadRecipe('mesa3d.org', 'linux-arm64', '26.0.3')).recipe
  expect(linux.dependencies?.linux).toMatchObject({ 'dri.freedesktop.org': '^2.4.110' })
  expect(linux.dependencies?.linux).toMatchObject({ 'llvm.org': '^22' })
  expect(linux.build?.dependencies?.['llvm.org']).toBe('^22')
  expect(mesa.dependencies?.['facebook.com/zstd']).toBe('^1')
})

test('the advertised WebP viewer has a managed Linux GLUT dependency and mandatory health check', async () => {
  expect(recipe.dependencies?.linux).toMatchObject({ 'freeglut.sourceforge.io': '^3' })
  expect(freeglut.platforms).toContain('linux')
  expect(recipe.test?.required).toBe(true)
  expect(recipe.test?.script).toContain('vwebp -version | grep -F "{{version}}"')
  const native = (await loadRecipe('google.com/webp', 'linux-arm64', '1.6.0')).recipe
  expect(native.programs).toContain('vwebp')
  expect(native.build?.script).toContain('./configure --prefix={{prefix}} --enable-everything')
})
