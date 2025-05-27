import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

export default function shellcode(): string {
  // find self
  const pathDirs = process.env.PATH?.split(':') || []
  const dev_cmd = pathDirs
    .map(dir => join(dir, 'launchpad'))
    .find(cmd => existsSync(cmd)) || pathDirs
    .map(dir => join(dir, 'dev'))
    .find(cmd => existsSync(cmd))

  if (!dev_cmd)
    throw new Error('couldn\'t find `dev` or `launchpad`')

  const dataDirPath = datadir()

  return `
_pkgx_chpwd_hook() {
  if ! type _pkgx_dev_try_bye >/dev/null 2>&1 || _pkgx_dev_try_bye; then
    dir="$PWD"
    while [ "$dir" != / -a "$dir" != . ]; do
      if [ -f "${dataDirPath}/$dir/dev.pkgx.activated" ]; then
        if [[ "${dev_cmd}" == *"launchpad"* ]]; then
          eval "$(${dev_cmd} dev:dump)" "$dir"
        else
          eval "$(${dev_cmd})" "$dir"
        fi
        break
      fi
      dir="$(dirname "$dir")"
    done
  fi
}

dev() {
  case "$1" in
  off)
    if type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      dir="$PWD"
      while [ "$dir" != / -a "$dir" != . ]; do
        if [ -f "${dataDirPath}/$dir/dev.pkgx.activated" ]; then
          rm "${dataDirPath}/$dir/dev.pkgx.activated"
          break
        fi
        dir="$(dirname "$dir")"
      done
      PWD=/ _pkgx_dev_try_bye
    else
      echo "no devenv" >&2
    fi;;
  ''|on)
    if [ "$2" ]; then
      "${dev_cmd}" "$@"
    elif ! type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      mkdir -p "${dataDirPath}$PWD"
      touch "${dataDirPath}$PWD/dev.pkgx.activated"
      if [[ "${dev_cmd}" == *"launchpad"* ]]; then
        eval "$(${dev_cmd} dev:dump)"
      else
        eval "$(${dev_cmd})"
      fi
    else
      echo "devenv already active" >&2
    fi;;
  *)
    "${dev_cmd}" "$@";;
  esac
}

if [ -n "$ZSH_VERSION" ] && [ $(emulate) = zsh ]; then
  eval 'typeset -ag chpwd_functions

        if [[ -z "\${chpwd_functions[(r)_pkgx_chpwd_hook]+1}" ]]; then
          chpwd_functions=( _pkgx_chpwd_hook \${chpwd_functions[@]} )
        fi

        if [ "$TERM_PROGRAM" != Apple_Terminal ]; then
          _pkgx_chpwd_hook
        fi'
elif [ -n "$BASH_VERSION" ] && [ "$POSIXLY_CORRECT" != y ] ; then
  eval 'cd() {
          builtin cd "$@" || return
          _pkgx_chpwd_hook
        }
        _pkgx_chpwd_hook'
else
  POSIXLY_CORRECT=y
  echo "pkgx: dev: warning: unsupported shell" >&2
fi
`.trim()
}

export function datadir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME?.trim()
  if (xdgDataHome) {
    return join(xdgDataHome, 'pkgx', 'dev')
  }

  return join(platform_data_home_default(), 'pkgx', 'dev')
}

function platform_data_home_default(): string {
  const home = homedir()
  switch (platform()) {
    case 'darwin':
      return join(home, 'Library', 'Application Support')
    case 'win32': {
      const LOCALAPPDATA = process.env.LOCALAPPDATA
      if (LOCALAPPDATA) {
        return LOCALAPPDATA
      }
      else {
        return join(home, 'AppData', 'Local')
      }
    }
    default:
      return join(home, '.local', 'share')
  }
}
