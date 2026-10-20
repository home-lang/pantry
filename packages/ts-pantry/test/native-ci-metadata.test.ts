import { expect, test } from 'bun:test'
import { mergeRecipeVersions } from '../../../.github/scripts/register-native-ci-packages'

test('registering an older CI pin never downgrades or deletes a newer catalogued release', () => {
  expect(mergeRecipeVersions(['2.0.0', '1.0.0'], ['1.5.0', '1.0.0'])).toEqual(['2.0.0', '1.5.0', '1.0.0'])
  expect(mergeRecipeVersions([], ['262.1', '262'])).toEqual(['262.1', '262'])
  expect(mergeRecipeVersions(['155.0.8059.84'], ['155.0.8059.84.1'])).toEqual(['155.0.8059.84.1', '155.0.8059.84'])
  for (const input of [[], ['latest'], ['1.2.3;id'], ['../1.2.3']])
    expect(() => mergeRecipeVersions([], input)).toThrow('exact stable versions')
})
