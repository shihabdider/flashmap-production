/* eslint-disable @typescript-eslint/no-explicit-any */
import { Instance, types } from 'mobx-state-tree'
import { getConf, readConfObject } from '../../configuration'
import PluginManager from '../../PluginManager'
import { MenuItem } from '../../ui'
import { ElementId } from '../../util/types/mst'
import { GenericFilehandle, RemoteFile } from 'generic-filehandle'

// these MST models only exist for tracks that are *shown*.
// they should contain only UI state for the track, and have
// a reference to a track configuration (stored under
// session.configuration.assemblies.get(assemblyName).tracks).

// note that multiple displayed tracks could use the same configuration.
export const InternetAccount = types
  .model('InternetAccount', {
    id: ElementId,
    type: types.string,
  })
  .volatile(() => ({
    loggedIn: false,
    internetAccountMap: {},
  }))
  .views(self => ({
    get name() {
      return getConf(self, 'name')
    },

    get internetAccountId() {
      return getConf(self, 'internetAccountId')
    },

    get accountConfig() {
      // @ts-ignore
      return readConfObject(self.configuration)
    },

    handlesLocation(location: Location): boolean {
      return true
    },
    // distinct set of track items that are particular to this track type.
    // for base, there are none
    //
    // note: this attribute is helpful when composing together multiple
    // subtracks
    get composedTrackMenuItems(): MenuItem[] {
      return []
    },
  }))
  .actions(self => ({
    openLocation(location: Location): GenericFilehandle {
      return new RemoteFile(String(location))
    },
    setLoggedIn(bool: boolean) {
      self.loggedIn = bool
    },
    getTokensFromStorage() {
      const keyMap: Record<string, string> = {}
      Object.entries(sessionStorage).forEach(entry => {
        const [key, value] = entry
        if (key.includes('token')) {
          keyMap[key.split('-')[0]] = value
        }
      })
      return keyMap
    },
    removeTokenFromStorage(id: string, keyMap: Record<string, string>) {
      const expiredTokenKey = Object.keys(sessionStorage).find(key => {
        return key.split('-')[0] === id
      })
      if (expiredTokenKey) {
        sessionStorage.removeItem(expiredTokenKey)
        delete keyMap[id]
      }
      return keyMap
    },
    setInternetAccountMap(map: { [key: string]: string }) {
      self.internetAccountMap = map
    },
    handleRpcMethodCall(
      location: Location,
      map: Record<string, string>,
      args: {},
    ) {
      return this.openLocation(location)
    },
  }))

export type BaseInternetAccountStateModel = typeof InternetAccount
export type BaseInternetAccountModel = Instance<BaseInternetAccountStateModel>
