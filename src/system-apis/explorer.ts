/**
 * @file 浏览文件
 * @author BenzLeung
 */

import * as fsPromise from 'node:fs/promises'
import * as path from 'path'
import { extWhitelist, folderWhitelist, photoExt } from './config'

export interface FileInfoBase {
  /**
   * 文件名.txt
   */
  fileName: string;
  /**
   * 文件名不含扩展名
   */
  fileNameWithoutExtension: string;
  /**
   * txt （不含点.）
   */
  extension: string;
  /**
   * D:\完整\路径\文件名.txt
   */
  fullPath: string;
  /**
   * D:\只有\路径
   */
  path: string;
  /**
   * 是否为文件夹
   */
  isDirectory: boolean;
}

export interface FileInfoStat extends FileInfoBase {
  /**
   * 文件最近一次被访问的时间戳
   */
  atimeMs: number;
  /**
   * 文件最近一次修改的时间戳
   */
  mtimeMs: number;
  /**
   * 文件最近一次状态变动的时间戳
   */
  ctimeMs: number;
  /**
   * 文件创建的时间戳
   */
  birthtimeMs: number;
  /**
   * 文件最近一次被访问的时间
   */
  atime: Date;
  /**
   * 文件最近一次修改的时间
   */
  mtime: Date;
  /**
   * 文件最近一次状态变动的时间
   */
  ctime: Date;
  /**
   * 文件创建的时间
   */
  birthtime: Date;
}

export interface FileInfoMeta extends FileInfoStat {
  title?: string
  thumbnail?: string
  metadata?: {[key: string]: string | number}
}

export const pathResolveWithEnv = (folder: string): string => {
  let _realFolder = folder
  const envRegex = /%(.+)%/
  const m = folder.match(envRegex)
  if (m && m[1]) {
    const env = process.env[m[1]]
    if (env) {
      _realFolder = _realFolder.replace(m[0], env)
    }
  }
  return path.resolve(_realFolder)
}

export const checkFolderWhitelist = (folder: string): boolean => {
  let _realFolder = pathResolveWithEnv(folder)
  let isWhite = false
  const sep = path.sep
  for (let wl of folderWhitelist) {
    const _realWL = pathResolveWithEnv(wl)
    if (
      (
        folder.indexOf(`${sep}..`) < 0 &&
        `${folder.trim()}${sep}`.indexOf(`${wl}${sep}`) === 0
      ) ||
      `${_realFolder.trim()}${sep}`.indexOf(`${_realWL}${sep}`) === 0
    ) {
      isWhite = true
    }
  }
  return isWhite
}

export const getFilesBaseInFolder = async (folder: string): Promise<FileInfoBase[]> => {
  const _folder = pathResolveWithEnv(folder)
  const files = await fsPromise.readdir(_folder, {withFileTypes: true})
  const extSplitRegex = /\.(?=[^.]+$)/
  return files.map((file) => {
    const isDirectory = file.isDirectory()
    const fileName = file.name
    const [
      fileNameWithoutExtension = '',
      extension = '',
    ] = isDirectory ? [fileName, ''] : fileName.split(extSplitRegex)
    const fullPath = path.join(folder, fileName)
    return {
      fileName,
      fileNameWithoutExtension,
      extension: extension.toLowerCase(),
      fullPath,
      path: _folder,
      isDirectory,
    }
  })
}

export const fillFileStatToFileBase = async (files: FileInfoBase[]): Promise<FileInfoStat[]> => {
  const statsPromise = files.map((file) => fsPromise.stat(file.fullPath))
  const stats = await Promise.all(statsPromise)
  return stats.map((stat, i) => {
    const { atime, mtime, ctime, birthtime, atimeMs, mtimeMs, ctimeMs, birthtimeMs } = stat
    return {
      ...files[i],
      atime, mtime, ctime, birthtime, atimeMs, mtimeMs, ctimeMs, birthtimeMs,
    }
  })
}

export const getFilesStatInFolder = async (folder: string): Promise<FileInfoStat[]> => {
  return await fillFileStatToFileBase(
    await getFilesBaseInFolder(folder)
  )
}

const filesFilterFn: ((file: FileInfoBase) => boolean)[] = []

export const filterFiles = (files: FileInfoBase[]): FileInfoBase[] => {
  return files.filter((file) =>
    filesFilterFn.reduce(
      (acc, fn) => acc && fn(file),
      true
    )
  )
}

export const filterDot = (file: FileInfoBase): boolean =>
  /^\./.test(file.fileName)
filesFilterFn.push(filterDot)

export const filterExt = (file: FileInfoBase): boolean =>
  file.isDirectory || extWhitelist.includes(file.extension)
filesFilterFn.push(filterExt)

export const filterThumbnail = (file: FileInfoBase): boolean =>
  !photoExt.includes(file.extension) || file.fileName.indexOf('.thumb') < 0
filesFilterFn.push(filterThumbnail)

export const getFilteredFilesInFolder = async (folder: string): Promise<FileInfoBase[]> => {
  if (!checkFolderWhitelist(folder)) {
    return []
  }
  return filterFiles(await getFilesStatInFolder(folder))
}
