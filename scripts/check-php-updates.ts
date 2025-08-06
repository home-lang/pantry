#!/usr/bin/env bun

/**
 * PHP Update Checker for Launchpad
 *
 * This script checks if there are new PHP versions available and determines
 * if a rebuild is needed. It compares current versions with the latest available.
 */

interface PHPVersion {
  version: string;
  status: 'stable' | 'security' | 'eol';
  releaseDate?: string;
}

interface BuildInfo {
  currentVersions: string[];
  latestVersions: string[];
  hasNewVersions: boolean;
  newVersions: string[];
  rebuildNeeded: boolean;
  reason: string;
}

async function getCurrentVersions(): Promise<string[]> {
  try {
    // Read current versions from the script
    const { readFileSync } = await import('fs');
    const scriptContent = readFileSync('scripts/get-php-versions.ts', 'utf8');

    // Extract fallback versions from the script
    const fallbackMatch = scriptContent.match(/return \['([^']+)', '([^']+)', '([^']+)', '([^']+)'\]/);
    if (fallbackMatch) {
      return [fallbackMatch[1], fallbackMatch[2], fallbackMatch[3], fallbackMatch[4]];
    }

    // If we can't parse from script, use hardcoded fallback
    return ['8.4.11', '8.3.14', '8.2.26', '8.1.30'];
  } catch (error) {
    console.error('Failed to read current versions:', error);
    return ['8.4.11', '8.3.14', '8.2.26', '8.1.30'];
  }
}

async function getLatestVersions(): Promise<string[]> {
  try {
    // Use ts-pkgx to get PHP versions
    const { execSync } = await import('child_process');
    const output = execSync('bunx ts-pkgx get-php-versions', { encoding: 'utf8' });

    // Parse the output - assuming it returns a JSON array or comma-separated string
    let versions: string[];
    try {
      versions = JSON.parse(output);
    } catch {
      // If not JSON, split by comma
      versions = output.trim().split(',').map(v => v.trim());
    }

    // Filter to only stable versions and sort by version
    const stableVersions = versions
      .filter(v => v.match(/^\d+\.\d+\.\d+$/))
      .sort((a, b) => {
        const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
        const [bMajor, bMinor, bPatch] = b.split('.').map(Number);

        if (aMajor !== bMajor) return bMajor - aMajor;
        if (aMinor !== bMinor) return bMinor - aMinor;
        return bPatch - aPatch;
      })
      .slice(0, 4); // Keep only the 4 most recent versions

    return stableVersions;
  } catch (error) {
    console.error('Failed to fetch latest PHP versions from ts-pkgx:', error);

    // Fallback to current versions
    return await getCurrentVersions();
  }
}

function compareVersions(current: string[], latest: string[]): BuildInfo {
  const currentSet = new Set(current);
  const latestSet = new Set(latest);

  // Find new versions
  const newVersions = latest.filter(v => !currentSet.has(v));

  // Find removed versions
  const removedVersions = current.filter(v => !latestSet.has(v));

  const hasNewVersions = newVersions.length > 0;
  const hasRemovedVersions = removedVersions.length > 0;
  const rebuildNeeded = hasNewVersions || hasRemovedVersions;

  let reason = '';
  if (hasNewVersions && hasRemovedVersions) {
    reason = `New versions available: ${newVersions.join(', ')}. Removed versions: ${removedVersions.join(', ')}`;
  } else if (hasNewVersions) {
    reason = `New versions available: ${newVersions.join(', ')}`;
  } else if (hasRemovedVersions) {
    reason = `Versions removed: ${removedVersions.join(', ')}`;
  } else {
    reason = 'No changes detected';
  }

  return {
    currentVersions: current,
    latestVersions: latest,
    hasNewVersions,
    newVersions,
    rebuildNeeded,
    reason
  };
}

async function checkForUpdates(): Promise<BuildInfo> {
  const currentVersions = await getCurrentVersions();
  const latestVersions = await getLatestVersions();

  return compareVersions(currentVersions, latestVersions);
}

function generateOutput(buildInfo: BuildInfo): void {
  console.log('🔍 PHP Version Update Check');
  console.log('');
  console.log('📊 Version Comparison:');
  console.log(`  Current: ${buildInfo.currentVersions.join(', ')}`);
  console.log(`  Latest:  ${buildInfo.latestVersions.join(', ')}`);
  console.log('');

  if (buildInfo.rebuildNeeded) {
    console.log('🔄 Rebuild Required: YES');
    console.log(`   Reason: ${buildInfo.reason}`);

    if (buildInfo.hasNewVersions) {
      console.log(`   New versions: ${buildInfo.newVersions.join(', ')}`);
    }
  } else {
    console.log('✅ Rebuild Required: NO');
    console.log(`   Reason: ${buildInfo.reason}`);
  }

  // Output for GitHub Actions
  console.log('');
  console.log('GitHub Actions Output:');
  console.log(`rebuild_needed=${buildInfo.rebuildNeeded}`);
  console.log(`reason=${buildInfo.reason}`);
  console.log(`current_versions=${JSON.stringify(buildInfo.currentVersions)}`);
  console.log(`latest_versions=${JSON.stringify(buildInfo.latestVersions)}`);
  console.log(`new_versions=${JSON.stringify(buildInfo.newVersions)}`);
}

async function main(): Promise<void> {
  const buildInfo = await checkForUpdates();
  generateOutput(buildInfo);
}

// Run the script
if (import.meta.main) {
  main().catch(console.error);
}

export { checkForUpdates, compareVersions, getCurrentVersions, getLatestVersions };
