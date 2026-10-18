import { expect, test } from 'bun:test'
import { mergeRecipeVersions } from '../../../.github/scripts/register-native-ci-packages'

test('registering an older CI pin never downgrades or deletes a newer catalogued release', () => {
  expect(mergeRecipeVersions(['2.0.0', '1.0.0'], ['1.5.0', '1.0.0'])).toEqual(['2.0.0', '1.5.0', '1.0.0'])
  expect(mergeRecipeVersions([], ['262.1', '262'])).toEqual(['262.1', '262'])
  for (const input of [[], ['latest'], ['1.2.3;id'], ['../1.2.3']])
    expect(() => mergeRecipeVersions([], input)).toThrow('exact stable versions')
})
