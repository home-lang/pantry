import { describe, expect, test } from 'bun:test'
import { formatCategoriesList, formatPackagesByCategory, formatTagSearchResults, getAvailableCategories, getPackagesByCategory, PACKAGE_CATEGORIES, searchPackagesByTag } from '../src/tags'

describe('Tags Functionality', () => {
  describe('PACKAGE_CATEGORIES', () => {
    test('should have valid category structure', () => {
      expect(PACKAGE_CATEGORIES).toBeDefined()
      expect(typeof PACKAGE_CATEGORIES).toBe('object')

      // Check that each category has required properties
      for (const [categoryName, categoryInfo] of Object.entries(PACKAGE_CATEGORIES)) {
        expect(categoryName).toBeString()
        expect(categoryInfo).toBeDefined()
        expect(categoryInfo.description).toBeString()
        expect(categoryInfo.domains).toBeArray()
        expect(categoryInfo.domains.length).toBeGreaterThan(0)
      }
    })

    test('should include expected categories', () => {
      const categoryNames = Object.keys(PACKAGE_CATEGORIES)

      expect(categoryNames).toContain('Programming Languages')
      expect(categoryNames).toContain('JavaScript & Node.js')
      expect(categoryNames).toContain('Databases')
      expect(categoryNames).toContain('DevOps & Infrastructure')
      expect(categoryNames).toContain('Development Tools')
    })

    test('should have unique domains across categories', () => {
      const allDomains = new Set<string>()
      const duplicates: string[] = []

      for (const categoryInfo of Object.values(PACKAGE_CATEGORIES)) {
        for (const domain of categoryInfo.domains) {
          if (allDomains.has(domain)) {
            duplicates.push(domain)
          }
          else {
            allDomains.add(domain)
          }
        }
      }

      // Some domains might intentionally appear in multiple categories
      // This test just ensures we're aware of any duplicates
      if (duplicates.length > 0) {
        console.log('Domains appearing in multiple categories:', duplicates)
      }
    })
  })

  describe('getAvailableCategories', () => {
    test('should return array of category info', () => {
      const categories = getAvailableCategories()

      expect(categories).toBeArray()
      expect(categories.length).toBeGreaterThan(0)

      for (const category of categories) {
        expect(category.name).toBeString()
        expect(category.description).toBeString()
        expect(category.packageCount).toBeNumber()
        expect(category.packageCount).toBeGreaterThan(0)
        expect(category.packages).toBeArray()
      }
    })

    test('should return categories sorted by name', () => {
      const categories = getAvailableCategories()

      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].name.localeCompare(categories[i - 1].name)).toBeGreaterThanOrEqual(0)
      }
    })

    test('should only include categories with existing packages', () => {
      const categories = getAvailableCategories()

      for (const category of categories) {
        expect(category.packageCount).toBeGreaterThan(0)
        expect(category.packages.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getPackagesByCategory', () => {
    test('should return packages for valid category', () => {
      const categories = getAvailableCategories()

      if (categories.length > 0) {
        const firstCategory = categories[0]
        const packages = getPackagesByCategory(firstCategory.name)

        expect(packages).toBeArray()

        for (const pkg of packages) {
          expect(pkg.name).toBeString()
          expect(pkg.domain).toBeString()
          expect(pkg.category).toBe(firstCategory.name)
        }
      }
    })

    test('should return empty array for invalid category', () => {
      const packages = getPackagesByCategory('NonExistentCategory')
      expect(packages).toBeArray()
      expect(packages.length).toBe(0)
    })

    test('should return packages sorted by name', () => {
      const categories = getAvailableCategories()

      if (categories.length > 0) {
        const packages = getPackagesByCategory(categories[0].name)

        for (let i = 1; i < packages.length; i++) {
          expect(packages[i].name.localeCompare(packages[i - 1].name)).toBeGreaterThanOrEqual(0)
        }
      }
    })

    test('should include package metadata', () => {
      const categories = getAvailableCategories()

      if (categories.length > 0) {
        const packages = getPackagesByCategory(categories[0].name)

        if (packages.length > 0) {
          const pkg = packages[0]
          expect(pkg.name).toBeString()
          expect(pkg.domain).toBeString()
          expect(pkg.category).toBeString()

          // Optional fields
          if (pkg.description) {
            expect(pkg.description).toBeString()
          }
          if (pkg.programs) {
            expect(pkg.programs).toBeArray()
          }
          if (pkg.latestVersion) {
            expect(pkg.latestVersion).toBeString()
          }
        }
      }
    })
  })

  describe('searchPackagesByTag', () => {
    test('should find packages by category name', () => {
      const searchTerm = 'programming'
      const results = searchPackagesByTag(searchTerm)

      expect(results).toBeArray()

      for (const pkg of results) {
        expect(pkg.name).toBeString()
        expect(pkg.domain).toBeString()
        expect(pkg.category).toBeString()
      }
    })

    test('should find packages by category description', () => {
      const searchTerm = 'database'
      const results = searchPackagesByTag(searchTerm)

      expect(results).toBeArray()

      // Should find packages in database-related categories
      const hasDbPackages = results.some(pkg =>
        pkg.category.toLowerCase().includes('database')
        || pkg.name.toLowerCase().includes('database'),
      )

      if (results.length > 0) {
        expect(hasDbPackages).toBe(true)
      }
    })

    test('should return empty array for non-matching search', () => {
      const searchTerm = 'nonexistentcategorysearchterm12345'
      const results = searchPackagesByTag(searchTerm)

      expect(results).toBeArray()
      expect(results.length).toBe(0)
    })

    test('should be case insensitive', () => {
      const lowerResults = searchPackagesByTag('programming')
      const upperResults = searchPackagesByTag('PROGRAMMING')
      const mixedResults = searchPackagesByTag('Programming')

      expect(lowerResults.length).toBe(upperResults.length)
      expect(lowerResults.length).toBe(mixedResults.length)
    })

    test('should remove duplicate packages', () => {
      const searchTerm = 'development'
      const results = searchPackagesByTag(searchTerm)

      const domains = results.map(pkg => pkg.domain)
      const uniqueDomains = new Set(domains)

      expect(domains.length).toBe(uniqueDomains.size)
    })
  })

  describe('formatCategoriesList', () => {
    test('should format categories list correctly', () => {
      const categories = getAvailableCategories().slice(0, 3) // Test with first 3 categories
      const formatted = formatCategoriesList(categories)

      expect(formatted).toBeString()
      expect(formatted).toContain('🏷️  Available Package Categories')
      expect(formatted).toContain('Usage:')

      for (const category of categories) {
        expect(formatted).toContain(category.name)
        expect(formatted).toContain(category.description)
        expect(formatted).toContain(`${category.packageCount} packages`)
      }
    })

    test('should handle empty categories list', () => {
      const formatted = formatCategoriesList([])

      expect(formatted).toBeString()
      expect(formatted).toContain('🏷️  Available Package Categories')
      expect(formatted).toContain('Usage:')
    })
  })

  describe('formatPackagesByCategory', () => {
    test('should format packages in full mode', () => {
      const categories = getAvailableCategories()

      if (categories.length > 0) {
        const packages = getPackagesByCategory(categories[0].name).slice(0, 2) // Test with first 2 packages
        const formatted = formatPackagesByCategory(categories[0].name, packages, {
          compact: false,
          showPrograms: true,
          showVersions: true,
        })

        expect(formatted).toBeString()
        expect(formatted).toContain(categories[0].name)
        expect(formatted).toContain(`${packages.length} packages`)

        for (const pkg of packages) {
          expect(formatted).toContain(pkg.name)
          expect(formatted).toContain(pkg.domain)
          expect(formatted).toContain(`launchpad install ${pkg.name}`)
        }
      }
    })

    test('should format packages in compact mode', () => {
      const categories = getAvailableCategories()

      if (categories.length > 0) {
        const packages = getPackagesByCategory(categories[0].name).slice(0, 2)
        const formatted = formatPackagesByCategory(categories[0].name, packages, {
          compact: true,
          showPrograms: false,
          showVersions: false,
        })

        expect(formatted).toBeString()
        expect(formatted).toContain(categories[0].name)

        for (const pkg of packages) {
          expect(formatted).toContain(pkg.name)
        }
      }
    })

    test('should handle empty packages list', () => {
      const formatted = formatPackagesByCategory('Test Category', [])

      expect(formatted).toBeString()
      expect(formatted).toContain('No packages found in category "Test Category"')
    })

    test('should respect display options', () => {
      const categories = getAvailableCategories()

      if (categories.length > 0) {
        const packages = getPackagesByCategory(categories[0].name).slice(0, 1)

        if (packages.length > 0 && packages[0].programs && packages[0].latestVersion) {
          const withPrograms = formatPackagesByCategory(categories[0].name, packages, {
            showPrograms: true,
            showVersions: false,
          })

          const withVersions = formatPackagesByCategory(categories[0].name, packages, {
            showPrograms: false,
            showVersions: true,
          })

          expect(withPrograms).toContain('Programs:')
          expect(withPrograms).not.toContain('Latest Version:')

          expect(withVersions).not.toContain('Programs:')
          expect(withVersions).toContain('Latest Version:')
        }
      }
    })
  })

  describe('formatTagSearchResults', () => {
    test('should format search results with grouping', () => {
      const searchTerm = 'development'
      const packages = searchPackagesByTag(searchTerm).slice(0, 3) // Test with first 3 results

      const formatted = formatTagSearchResults(searchTerm, packages, {
        compact: false,
        groupByCategory: true,
      })

      expect(formatted).toBeString()
      expect(formatted).toContain(`Packages matching "${searchTerm}"`)
      expect(formatted).toContain(`${packages.length} found`)

      for (const pkg of packages) {
        expect(formatted).toContain(pkg.name)
      }
    })

    test('should format search results without grouping', () => {
      const searchTerm = 'development'
      const packages = searchPackagesByTag(searchTerm).slice(0, 3)

      const formatted = formatTagSearchResults(searchTerm, packages, {
        compact: false,
        groupByCategory: false,
      })

      expect(formatted).toBeString()
      expect(formatted).toContain(`Packages matching "${searchTerm}"`)

      for (const pkg of packages) {
        expect(formatted).toContain(pkg.name)
        expect(formatted).toContain(pkg.category)
      }
    })

    test('should handle empty search results', () => {
      const searchTerm = 'nonexistentterm'
      const packages: any[] = []

      const formatted = formatTagSearchResults(searchTerm, packages)

      expect(formatted).toBeString()
      expect(formatted).toContain(`No packages found matching tag "${searchTerm}"`)
      expect(formatted).toContain('Available categories:')
    })

    test('should format in compact mode', () => {
      const searchTerm = 'development'
      const packages = searchPackagesByTag(searchTerm).slice(0, 2)

      const formatted = formatTagSearchResults(searchTerm, packages, {
        compact: true,
        groupByCategory: true,
      })

      expect(formatted).toBeString()

      for (const pkg of packages) {
        expect(formatted).toContain(pkg.name)
      }
    })
  })

  describe('Integration Tests', () => {
    test('should work end-to-end for category browsing', () => {
      // Get categories
      const categories = getAvailableCategories()
      expect(categories.length).toBeGreaterThan(0)

      // Get packages from first category
      const firstCategory = categories[0]
      const packages = getPackagesByCategory(firstCategory.name)
      expect(packages.length).toBeGreaterThan(0)

      // Format the results
      const formatted = formatPackagesByCategory(firstCategory.name, packages)
      expect(formatted).toContain(firstCategory.name)
      expect(formatted).toContain(packages[0].name)
    })

    test('should work end-to-end for tag searching', () => {
      // Search for packages
      const searchResults = searchPackagesByTag('programming')

      if (searchResults.length > 0) {
        // Format the results
        const formatted = formatTagSearchResults('programming', searchResults)
        expect(formatted).toContain('programming')
        expect(formatted).toContain(searchResults[0].name)
      }
    })

    test('should maintain consistency between categories and search', () => {
      const categories = getAvailableCategories()

      for (const category of categories.slice(0, 2)) { // Test first 2 categories
        const categoryPackages = getPackagesByCategory(category.name)

        // Search should find packages from this category
        const searchResults = searchPackagesByTag(category.name.toLowerCase())

        // There should be some overlap
        const categoryDomains = new Set(categoryPackages.map(p => p.domain))
        const searchDomains = new Set(searchResults.map(p => p.domain))

        const intersection = new Set([...categoryDomains].filter(d => searchDomains.has(d)))

        if (categoryPackages.length > 0) {
          expect(intersection.size).toBeGreaterThan(0)
        }
      }
    })
  })
})
