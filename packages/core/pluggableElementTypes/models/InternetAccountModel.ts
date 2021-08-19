import { Instance, types } from 'mobx-state-tree'
import { getConf } from '../../configuration'
import { ElementId } from '../../util/types/mst'
import { GenericFilehandle, RemoteFile } from 'generic-filehandle'
import { FileLocation } from '@jbrowse/core/util/types'

export const InternetAccount = types
  .model('InternetAccount', {
    id: ElementId,
    type: types.string,
  })
  .views(self => ({
    get name() {
      return getConf(self, 'name')
    },
    get internetAccountId() {
      return getConf(self, 'internetAccountId')
    },
    get authHeader() {
      return getConf(self, 'authHeader')
    },
    get tokenType() {
      return getConf(self, 'tokenType')
    },
    get accountConfig() {
      return getConf(self)
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handlesLocation(location: FileLocation): boolean {
      return false
    },
  }))
  .actions(() => ({
    openLocation(location: FileLocation): GenericFilehandle {
      return new RemoteFile(String(location))
    },
  }))

export type BaseInternetAccountStateModel = typeof InternetAccount
export type BaseInternetAccountModel = Instance<BaseInternetAccountStateModel>
