#!/bin/bash

# Exit on error
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Publishing all packages with OIDC..."

# Find pantry binary - prefer the built one, fall back to PATH
if [ -f "$ROOT_DIR/packages/zig/zig-out/bin/pantry" ]; then
  PANTRY_BIN="$ROOT_DIR/packages/zig/zig-out/bin/pantry"
elif command -v pantry >/dev/null 2>&1; then
  PANTRY_BIN="pantry"
else
  echo "Error: pantry binary not found. Build it first with 'cd packages/zig && zig build'"
  exit 1
fi

echo "Using pantry binary: $PANTRY_BIN"

# Check if --dry-run flag was passed
DRY_RUN=""
if [ "$1" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "DRY RUN MODE - no packages will be published"
fi

for dir in "$ROOT_DIR"/packages/*/ ; do
  if [ -d "$dir" ]; then
    package_name=$(basename "$dir")
    package_json="$dir/package.json"
    pantry_json="$dir/pantry.json"

    echo "----------------------------------------"
    echo "Processing $package_name..."

    # Skip if no package.json exists (e.g., zig package uses pantry.json instead)
    if [ ! -f "$package_json" ]; then
      echo "Skipping $package_name (no package.json - not an npm package)"
      echo "----------------------------------------"
      continue
    fi

    # Check if package is private using jq (available in CI) or grep fallback
    if command -v jq >/dev/null 2>&1; then
      is_private=$(jq -r '.private // false' "$package_json")
    else
      private_check=$(grep -E '"private":\s*true' "$package_json" || echo "")
      if [ -n "$private_check" ]; then
        is_private="true"
      else
        is_private="false"
      fi
    fi

    echo "Package $package_name private status: $is_private"

    if [ "$is_private" = "true" ]; then
      echo "Skipping $package_name (private package)"
    else
      # Propagate root README.md and LICENSE to package if missing
      COPIED_README=""
      COPIED_LICENSE=""

      if [ -f "$ROOT_DIR/README.md" ] && [ ! -f "$dir/README.md" ]; then
        cp "$ROOT_DIR/README.md" "$dir/README.md"
        COPIED_README="$dir/README.md"
        echo "  Copied root README.md to $package_name"
      fi

      if [ -f "$ROOT_DIR/LICENSE" ] && [ ! -f "$dir/LICENSE" ] && [ ! -f "$dir/LICENSE.md" ]; then
        cp "$ROOT_DIR/LICENSE" "$dir/LICENSE"
        COPIED_LICENSE="$dir/LICENSE"
        echo "  Copied root LICENSE to $package_name"
      elif [ -f "$ROOT_DIR/LICENSE.md" ] && [ ! -f "$dir/LICENSE" ] && [ ! -f "$dir/LICENSE.md" ]; then
        cp "$ROOT_DIR/LICENSE.md" "$dir/LICENSE.md"
        COPIED_LICENSE="$dir/LICENSE.md"
        echo "  Copied root LICENSE.md to $package_name"
      fi

      echo "Publishing $package_name with OIDC..."
      cd "$dir"
      $PANTRY_BIN publish --access public $DRY_RUN
      cd - > /dev/null  # Suppress the directory change message

      # Cleanup propagated files
      [ -n "$COPIED_README" ] && rm -f "$COPIED_README"
      [ -n "$COPIED_LICENSE" ] && rm -f "$COPIED_LICENSE"
    fi

    echo "----------------------------------------"
  fi
done

echo "All packages published successfully!"
