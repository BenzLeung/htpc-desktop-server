/**
 * @file Config
 * @author BenzLeung
 */


// todo: move to a config file
export const folderWhitelist = [
  '%USERPROFILE%\\Desktop',
  '%APPDATA%\\Microsoft\\Windows\\Start Menu',
  'E:\\Benz',
]

export const executableExt = [
  '',
  'exe',
  'bat',
  'cmd',
]

export const linkExt = [
  'lnk',
  'url',
]

export const videoExt = [
  'avi',
  'mp4',
  'mkv',
  'iso',
]

export const musicExt = [
  'mp3',
  'm4a',
  'wav',
  'flac',
  'ape',
  'wma',
]

export const photoExt = [
  'jpg',
  'jpeg',
  'png',
]

export const extWhitelist = [
  ...executableExt,
  ...linkExt,
  ...videoExt,
  ...musicExt,
  ...photoExt,
]
