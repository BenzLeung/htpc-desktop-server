import * as os from 'os'

const OSTYPES: {[key: string]: string} = {
  Darwin: 'mac',
  Windows_NT: 'win',
  // todo: linux
}

export const osType = OSTYPES[os.type()] || 'win'
export function isMac() {
  return osType === 'mac'
}

export function isWin() {
  return osType === 'win'
}
