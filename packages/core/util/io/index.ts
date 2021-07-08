import { LocalFile, BlobFile, GenericFilehandle } from 'generic-filehandle'
import ElectronLocalFile from './ElectronLocalFile'
import ElectronRemoteFile from './ElectronRemoteFile'
import { openUrl as rangeFetcherOpenUrl } from './rangeFetcher'
import {
  FileLocation,
  LocalPathLocation,
  UriLocation,
  BlobLocation,
} from '../types'
import { getBlob, getAccessToken } from '../tracks'

declare global {
  interface Window {
    electron?: import('electron').AllElectron
  }
}

// this is recommended in a later comment in https://github.com/electron/electron/issues/2288
// for detecting electron in a renderer process, which is the one that has node enabled for us
// const isElectron = process.versions.electron
// const i2 = process.versions.hasOwnProperty('electron')
const isElectron = /electron/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : '',
)

export const openUrl = (arg: string, headers?: HeadersInit) => {
  return isElectron
    ? new ElectronRemoteFile(arg)
    : rangeFetcherOpenUrl(arg, headers)
}

function isUriLocation(location: FileLocation): location is UriLocation {
  return 'uri' in location
}

function isLocalPathLocation(
  location: FileLocation,
): location is LocalPathLocation {
  return 'localPath' in location
}

function isBlobLocation(location: FileLocation): location is BlobLocation {
  return 'blobId' in location
}

export function openLocation(location: FileLocation): GenericFilehandle {
  if (!location) {
    throw new Error('must provide a location to openLocation')
  }
  if (isElectron) {
    if (isUriLocation(location)) {
      if (!location.uri) {
        throw new Error('No URI provided')
      }
      return new ElectronRemoteFile(location.uri)
    }
    if (isLocalPathLocation(location)) {
      if (!location.localPath) {
        throw new Error('No local path provided')
      }
      return new ElectronLocalFile(location.localPath)
    }
  } else {
    if (isUriLocation(location)) {
      if (!location.uri) {
        throw new Error('No URI provided')
      }
      let optionalHeaders = undefined
      if (location.authHeader && location.authTokenReference) {
        const token = getAccessToken(location.authTokenReference as string)
        if (token) {
          optionalHeaders = {
            [location.authHeader]: `Bearer ${token}`,
          }
        }
      }
      return openUrl(
        location.baseUri
          ? new URL(location.uri, location.baseUri).href
          : location.uri,
        optionalHeaders,
      )
    }
    if (isLocalPathLocation(location)) {
      if (!location.localPath) {
        throw new Error('No local path provided')
      }
      return new LocalFile(location.localPath)
    }
  }
  // TODOAUTH pass across tokens like you pass the blob file
  if (isBlobLocation(location)) {
    // special case where blob is not directly stored on the model, use a getter
    const blob = getBlob(location.blobId)
    if (!blob) {
      throw new Error(
        `file ("${location.name}") was opened locally from a previous session. To restore it, go to track settings and reopen the file`,
      )
    }
    return new BlobFile(blob)
  }
  throw new Error('invalid fileLocation')
}
