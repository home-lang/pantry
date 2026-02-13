#!/bin/bash

# Generate comprehensive documentation for ts-pkgx packages
# This script creates VitePress-compatible markdown files

echo "🚀 Generating ts-pkgx package documentation..."

# Change to the project root directory
cd "$(dirname "$0")/.."

# Run the documentation generation command
bun run pkgx:docs

echo "✅ Documentation generation complete!"
echo "📍 Generated files:"
echo "   - docs/package-catalog.md (main catalog)"
echo "   - docs/packages/*.md (individual package pages)"
echo "   - docs/categories/*.md (category pages)"
echo ""
echo "🌐 To preview the docs locally:"
echo "   bun run dev:docs"
echo ""
echo "🚀 To build for production:"
echo "   bun run build:docs"
