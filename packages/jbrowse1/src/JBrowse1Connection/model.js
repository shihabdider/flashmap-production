import {
  ConfigurationReference,
  readConfObject,
} from '@gmod/jbrowse-core/configuration'
import connectionModelFactory from '@gmod/jbrowse-core/BaseConnectionModel'
import { types } from 'mobx-state-tree'
import configSchema from './configSchema'

import { fetchJb1 } from './jb1ConfigLoad'
import { convertTrackConfig, createRefSeqsAdapter } from './jb1ToJb2'

export default function(pluginManager) {
  return types.compose(
    'JBrowse1Connection',
    connectionModelFactory(pluginManager),
    types
      .model({ configuration: ConfigurationReference(configSchema) })
      .actions(self => ({
        connect() {
          const dataDirLocation = readConfObject(
            self.configuration,
            'dataDirLocation',
          )
          fetchJb1(dataDirLocation).then(config =>
            createRefSeqsAdapter(config.refSeqs).then(adapter => {
              const jb2Tracks = config.tracks.map(track =>
                convertTrackConfig(track, config.dataRoot),
              )
              self.setSequence({
                type: 'ReferenceSequenceTrack',
                adapter,
              })
              self.setTrackConfs(jb2Tracks)
            }),
          )
        },
      })),
  )
}
