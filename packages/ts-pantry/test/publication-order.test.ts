import { expect, test } from 'bun:test'
import { publicationOrder } from '../scripts/publication-order'

test('publication follows dependency edges even when their dependency counts are equal', () => {
  const packages = [
    { domain: 'x.org/x11', depDomains: ['x.org/xcb', 'x.org/protocol'] },
    { domain: 'x.org/xcb', depDomains: ['x.org/xau', 'x.org/xdmcp'] },
    { domain: 'x.org/xau', depDomains: [] },
    { domain: 'x.org/xdmcp', depDomains: [] },
  ]
  const result = publicationOrder(packages).map(pkg => pkg.domain)
  expect(result.indexOf('x.org/xcb')).toBeLessThan(result.indexOf('x.org/x11'))
  for (const dependency of ['x.org/xau', 'x.org/xdmcp']) expect(result.indexOf(dependency)).toBeLessThan(result.indexOf('x.org/xcb'))
  expect(publicationOrder([...packages].reverse()).map(pkg => pkg.domain)).toEqual(result)
})

test('bootstrap cycles remain together and precede their consumers', () => {
  const packages = [
    { domain: 'a', depDomains: ['b'] },
    { domain: 'b', depDomains: ['a'] },
    { domain: 'c', depDomains: ['a'] },
  ]
  expect(publicationOrder(packages).map(pkg => pkg.domain)).toEqual(['a', 'b', 'c'])
  expect(() => publicationOrder([...packages, packages[0]])).toThrow('Duplicate')
})
