#!/bin/zsh

set -euo pipefail

v8_base='https://chromium.googlesource.com/v8/v8.git'
build_base='https://chromium.googlesource.com/chromium/src/build.git'

retry_delay_seconds=2
max_429_retries=2

if (( $# == 0 )); then
  refs=(
    branch-heads/11.0
    branch-heads/11.1
    branch-heads/11.2
    branch-heads/11.3
    branch-heads/12.0
    branch-heads/12.1
    branch-heads/12.2
    branch-heads/12.3
    branch-heads/12.4
    branch-heads/12.5
    branch-heads/12.6
    branch-heads/12.7
    branch-heads/12.8
    branch-heads/12.9
    branch-heads/13.0
  )
else
  refs=("$@")
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

fetch_http_code() {
  local url="$1"
  local attempt=0
  local code

  while :; do
    code="$(curl -o /dev/null -s -w '%{http_code}' "$url")"
    if [[ "$code" != "429" || "$attempt" -ge "$max_429_retries" ]]; then
      printf '%s\n' "$code"
      return 0
    fi
    sleep "$retry_delay_seconds"
    attempt=$((attempt + 1))
  done
}

fetch_text() {
  local url="$1"
  local attempt=0
  local body_file
  local code

  while :; do
    body_file="${tmpdir}/curl.$$.${RANDOM}"
    code="$(curl -sSL -w '%{http_code}' -o "$body_file" "$url")"

    if [[ "$code" == "200" ]]; then
      base64 --decode < "$body_file"
      rm -f "$body_file"
      return 0
    fi

    rm -f "$body_file"
    if [[ "$code" == "429" && "$attempt" -lt "$max_429_retries" ]]; then
      sleep "$retry_delay_seconds"
      attempt=$((attempt + 1))
      continue
    fi

    return 22
  done
}

extract_build_rev() {
  LC_ALL=C perl -ne "print qq{\$1\n} if m{/build\\.git' \\+ '\\@' \\+ '([0-9a-f]{40})'}" | head -n 1
}

extract_mac_sdk_version() {
  LC_ALL=C perl -ne 'print "$1\n" if /^\s*mac_sdk_official_version = "([^"]+)"/' | head -n 1
}

extract_windows_sdk_version() {
  LC_ALL=C perl -ne 'print "$1\n" if /^\s*SDK_VERSION = '\''([^'\'']+)'\''/' | head -n 1
}

extract_linux_sysroot_amd64() {
  LC_ALL=C perl -0ne 'print "$1\n" if /"[^"]*amd64"\s*:\s*\{.*?"SysrootDir"\s*:\s*"([^"]+)"/s' | head -n 1
}

printf '%-18s %-5s %-40s %-8s %-16s %s\n' \
  'ref' \
  'http' \
  'build_rev' \
  'mac_sdk' \
  'win_sdk' \
  'linux_sysroot_amd64'

for ref in "${refs[@]}"; do
  deps_url="${v8_base}/+/${ref}/DEPS?format=TEXT"
  code="$(fetch_http_code "$deps_url")"

  if [[ "$code" != "200" ]]; then
    printf '%-18s %-5s %-40s %-8s %-16s %s\n' "$ref" "$code" '-' '-' '-' '-'
    continue
  fi

  deps_file="${tmpdir}/${ref:t}.DEPS"
  fetch_text "$deps_url" > "$deps_file"
  build_rev="$(extract_build_rev < "$deps_file")"

  if [[ -z "$build_rev" ]]; then
    printf '%-18s %-5s %-40s %-8s %-16s %s\n' \
      "$ref" "$code" '<missing build rev>' '-' '-' '-'
    continue
  fi

  mac_sdk_url="${build_base}/+/${build_rev}/config/mac/mac_sdk.gni?format=TEXT"
  mac_sdk_version="$(fetch_text "$mac_sdk_url" | extract_mac_sdk_version || true)"
  mac_sdk_version="${mac_sdk_version:-<missing>}"

  win_sdk_url="${build_base}/+/${build_rev}/vs_toolchain.py?format=TEXT"
  win_sdk_version="$(fetch_text "$win_sdk_url" | extract_windows_sdk_version || true)"
  win_sdk_version="${win_sdk_version:-<missing>}"

  linux_sysroot_url="${build_base}/+/${build_rev}/linux/sysroot_scripts/sysroots.json?format=TEXT"
  linux_sysroot_amd64="$(fetch_text "$linux_sysroot_url" | extract_linux_sysroot_amd64 || true)"
  linux_sysroot_amd64="${linux_sysroot_amd64:-<missing>}"

  printf '%-18s %-5s %-40s %-8s %-16s %s\n' \
    "$ref" \
    "$code" \
    "$build_rev" \
    "$mac_sdk_version" \
    "$win_sdk_version" \
    "$linux_sysroot_amd64"
done
