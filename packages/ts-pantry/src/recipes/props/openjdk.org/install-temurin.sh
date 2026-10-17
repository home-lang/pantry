#!/bin/bash
set -euo pipefail

version=$1
platform=$2
architecture=$3
prefix=$4
IFS=. read -r -a parts <<< "$version"
if [[ ${#parts[@]} -lt 4 || ${#parts[@]} -gt 5 || ! $version =~ ^[0-9]+(\.[0-9]+)+$ ]]; then
  echo "A JDK pin must include its exact upstream build number: $version" >&2
  exit 1
fi
build=${parts[${#parts[@]}-1]}
unset "parts[$((${#parts[@]}-1))]"
runtime=$(IFS=.; printf '%s' "${parts[*]}")
if [[ ${parts[0]} == 8 ]]; then
  [[ ${#parts[@]} == 3 && ${parts[1]} == 0 ]]
  release="jdk8u${parts[2]}-b$(printf '%02d' "$build")"
  runtime="1.8.0_${parts[2]}-b$(printf '%02d' "$build")"
else
  if [[ ${#parts[@]} == 3 && ${parts[1]} == 0 && ${parts[2]} == 0 ]]; then runtime=${parts[0]}; fi
  release="jdk-$runtime+$build"
  runtime="$runtime+$build"
fi
case "$architecture" in
  aarch64|arm64) arch=aarch64 ;;
  x86-64|x86_64|x64) arch=x64 ;;
  *) echo "Unsupported JDK architecture: $architecture" >&2; exit 1 ;;
esac
case "$platform" in
  darwin) os=mac; strip=3 ;;
  linux) os=linux; strip=1 ;;
  *) echo "Unsupported JDK platform: $platform" >&2; exit 1 ;;
esac
release=${release//+/%2B}
base="https://api.adoptium.net/v3"
asset="$release/$os/$arch/jdk/hotspot/normal/eclipse"
curl --fail --location --silent --show-error "$base/binary/version/$asset" -o temurin-jdk.tar.gz
curl --fail --location --silent --show-error "$base/checksum/version/$asset" -o temurin-jdk.sha256
read -r expected ignored < temurin-jdk.sha256
[[ $expected =~ ^[a-fA-F0-9]{64}$ ]]
printf '%s  temurin-jdk.tar.gz\n' "$expected" | sha256sum --check --status
tar -xzf temurin-jdk.tar.gz --strip-components="$strip" -C "$prefix"

# Read the vendor's release record as data; never source an archive's shell text.
actual=''
while IFS='=' read -r key value; do
  if [[ $key == JAVA_RUNTIME_VERSION ]]; then
    actual=${value#\"}
    actual=${actual%\"}
  fi
done < "$prefix/release"
if [[ $actual != "$runtime" && $actual != "$runtime-LTS" ]]; then
  echo "JDK runtime identity mismatch: requested $runtime, archive reports $actual" >&2
  exit 1
fi
mkdir -p "$prefix/share/pantry"
printf '%s\n' "$runtime" > "$prefix/share/pantry/java-runtime-version.txt"
rm temurin-jdk.tar.gz temurin-jdk.sha256
